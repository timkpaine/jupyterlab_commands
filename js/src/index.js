import {Dialog, ICommandPalette, showDialog} from "@jupyterlab/apputils";

import {PageConfig} from "@jupyterlab/coreutils";

import {IDocumentManager} from "@jupyterlab/docmanager";

import {IFileBrowserFactory} from "@jupyterlab/filebrowser";

import {ILauncher} from "@jupyterlab/launcher";

import {request} from "requests-helper";

import "../style/index.css";

async function activate(app, docManager, palette, browser) {
  // grab templates from serverextension
  const res = await request("get", `${PageConfig.getBaseUrl()}commands/get`);
  if (res.ok) {
    const commands = res.json();
    commands.map((command) => {
      app.commands.addCommand(command, {
        execute: async () => {
          const result = await showDialog({
            buttons: [Dialog.cancelButton(), Dialog.okButton({label: "Ok"})],
            title: `Execute ${command}?`,
          });
          if (result.button.label === "Cancel") {
            return;
          }

          const folder = browser.defaultBrowser.model.path || "";

          if (!app.shell.currentWidget) {
            // need a current widget
            return;
          }

          const context = docManager.contextForWidget(app.shell.currentWidget);

          let path = "";
          let model = {};
          if (context) {
            path = context.path;
            model = context.model.toJSON();
          }

          // eslint-disable-next-line no-shadow
          const res = await request("post", `${PageConfig.getBaseUrl()}commands/run?command=${encodeURI(command)}`, {}, JSON.stringify({folder, path, model}));
          if (res.ok) {
            const resp = res.json();
            let body = "";
            if (resp) {
              body = resp.body;
            }
            await showDialog({
              body,
              buttons: [Dialog.okButton({label: "Ok"})],
              title: `Execute ${command} succeeded`,
            });
          } else {
            await showDialog({
              buttons: [Dialog.okButton({label: "Ok"})],
              title: `Execute ${command} failed`,
            });
          }
        },
        isEnabled: () => true,
        label: command,
      });

      palette.addItem({command, category: "Custom Commands"});

      return command;
    });
  }

  // eslint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab_commands is activated!");
}

const extension = {
  activate,
  autoStart: true,
  id: "jupyterlab_commands",
  optional: [ILauncher],
  requires: [IDocumentManager, ICommandPalette, IFileBrowserFactory],
};

export default extension;
export {activate as _activate};
