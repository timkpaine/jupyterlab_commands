import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  Dialog, ICommandPalette, showDialog,
} from "@jupyterlab/apputils";

import {
  PageConfig, URLExt,
} from "@jupyterlab/coreutils";

import {
  IDocumentManager,
} from "@jupyterlab/docmanager";

import {
  IFileBrowserFactory,
} from "@jupyterlab/filebrowser";

import {
  ILauncher,
} from "@jupyterlab/launcher";

import {
  IMainMenu,
} from "@jupyterlab/mainmenu";

import {
  INotebookTracker, NotebookPanel,
} from "@jupyterlab/notebook";

import {
  ReadonlyJSONObject,
} from "@lumino/coreutils";

import {
  IRequestResult, request,
} from "requests-helper";

import "../style/index.css";

const extension: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: "jupyterlab_commands",
  optional: [ILauncher],
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer, IMainMenu, IFileBrowserFactory, INotebookTracker],
};

function activate(app: JupyterFrontEnd,
                  docManager: IDocumentManager,
                  palette: ICommandPalette,
                  restorer: ILayoutRestorer,
                  menu: IMainMenu,
                  browser: IFileBrowserFactory,
                  tracker: INotebookTracker,
                  launcher: ILauncher | null) {

  function hasWidget(): boolean {
    return tracker.currentWidget !== null;
  }

  const exportPdf = "jupyterlab_commands:export-pdf";
  const exportHtml = "jupyterlab_commands:export-html";
  const services = app.serviceManager;

  function getCurrent(args: ReadonlyJSONObject): NotebookPanel | null {
    const widget = tracker.currentWidget;
    const activateArg = args.activate !== false;

    if (activateArg && widget) {
      app.shell.activateById(widget.id);
    }

    return widget;
  }

  // grab templates from serverextension
  request("get", PageConfig.getBaseUrl() + "commands/get").then((res: IRequestResult) => {
    if (res.ok) {
      const commands = res.json() as [string];
      for (const command of commands) {
      app.commands.addCommand(command, {
        execute: (args) => {
          showDialog({
              buttons: [Dialog.cancelButton(), Dialog.okButton({ label: "Ok" })],
              title: "Execute " + command + "?",
            }).then((result) => {
              if (result.button.label === "Cancel") {
                return;
              }

              const folder = browser.defaultBrowser.model.path || "";
              // const widget = app.shell.currentWidget;
              const context = docManager.contextForWidget(app.shell.currentWidget);

              let path = "";
              let model = {};
              if (context) {
                path = context.path;
                model = context.model.toJSON();
              }

              return new Promise((resolve) => {
                request("post",
                PageConfig.getBaseUrl() + "commands/run?command=" + encodeURI(command),
                {},
                JSON.stringify({folder, path, model})).then(
                  // tslint:disable-next-line: no-shadowed-variable
                  (res: IRequestResult) => {
                  if (res.ok) {
                    const resp = res.json() as {[key: string]: string};
                    let body = "";
                    if (resp) {
                      body = resp.body;
                    }
                    showDialog({
                        body,
                        buttons: [Dialog.okButton({ label: "Ok" })],
                        title: "Execute " + command + " succeeded",
                      }).then(() => {resolve(); });
                  } else {
                    showDialog({
                        buttons: [Dialog.okButton({ label: "Ok" })],
                        title: "Execute " + command + " failed",
                      }).then(() => {resolve(); });
                  }
                });

              });
            });
          },
          isEnabled: () => true,
          label: command,
        });
      palette.addItem({command, category: "Custom Commands"});
      }
    }
  });

  app.commands.addCommand(exportPdf, {
    execute: (args) => {
      const current = getCurrent(args);

      if (!current) {
        return;
      }

      const notebookPath = URLExt.encodeParts(current.context.path);
      const url = URLExt.join(
        services.serverSettings.baseUrl,
        "nbconvert",
        "pdf_hidecode",
        notebookPath,
      ) + "?download=true";
      const child = window.open("", "_blank");
      const { context } = current;

      if (context.model.dirty && !context.model.readOnly) {
        return context.save().then(() => { child.location.assign(url); });
      }

      return new Promise<void>((resolve) => {
        child.location.assign(url);
        resolve(undefined);
      });
    },
    isEnabled: hasWidget,
    label: "PDF - no code",
  });

  app.commands.addCommand(exportHtml, {
    execute: (args) => {
      const current = getCurrent(args);

      if (!current) {
        return;
      }

      const notebookPath = URLExt.encodeParts(current.context.path);
      const url = URLExt.join(
        services.serverSettings.baseUrl,
        "nbconvert",
        "html_hidecode",
        notebookPath,
      ) + "?download=true";
      const child = window.open("", "_blank");
      const { context } = current;

      if (context.model.dirty && !context.model.readOnly) {
        return context.save().then(() => { child.location.assign(url); });
      }

      return new Promise<void>((resolve) => {
        child.location.assign(url);
        resolve(undefined);
      });
    },
    isEnabled: hasWidget,
    label: "HTML - no code",
  });

  // Add the command to the palette.
  palette.addItem({command: exportPdf, category: "Custom Commands"});
  palette.addItem({command: exportHtml, category: "Custom Commands"});

  // tslint:disable-next-line: no-console
  console.log("JupyterLab extension jupyterlab_commands is activated!");
}

export default extension;
export {activate as _activate};
