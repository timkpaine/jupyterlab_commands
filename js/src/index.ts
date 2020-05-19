import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  Dialog, ICommandPalette, showDialog,
} from "@jupyterlab/apputils";

import {
  PageConfig,
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
  INotebookTracker,
} from "@jupyterlab/notebook";

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
                  // eslint-disable-next-line no-shadow
                  (res: IRequestResult) => {
                    if (res.ok) {
                      const resp: any = res.json();
                      let body = "";
                      if (resp) {
                        body = resp.body;
                      }
                      showDialog({
                        body,
                        buttons: [Dialog.okButton({ label: "Ok" })],
                        title: "Execute " + command + " succeeded",
                      }).then(() => {
                        resolve();
                      });
                    } else {
                      showDialog({
                        buttons: [Dialog.okButton({ label: "Ok" })],
                        title: "Execute " + command + " failed",
                      }).then(() => {
                        resolve();
                      });
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

  // eslint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab_commands is activated!");
}

export default extension;
export {activate as _activate};
