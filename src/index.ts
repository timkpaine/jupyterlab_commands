import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, showDialog, Dialog
} from '@jupyterlab/apputils';

import {
  PageConfig
} from '@jupyterlab/coreutils'

import {
  IDocumentManager
} from '@jupyterlab/docmanager';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  IMainMenu
} from '@jupyterlab/mainmenu';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_commands',
  autoStart: true,
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer, IMainMenu, IFileBrowserFactory],
  optional: [ILauncher],
  activate: activate
};


function activate(app: JupyterLab,
                  docManager: IDocumentManager,
                  palette: ICommandPalette,
                  restorer: ILayoutRestorer,
                  menu: IMainMenu,
                  browser: IFileBrowserFactory,
                  launcher: ILauncher | null) {

  // grab templates from serverextension
  var xhr = new XMLHttpRequest();
  xhr.open("GET", PageConfig.getBaseUrl() + "commands/get", true);
  xhr.onload = function (e:any) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let commands = JSON.parse(xhr.responseText);
        for (let command of commands){
        app.commands.addCommand(command, {
          label: command,
          isEnabled: () => true,
          execute: args => {
            showDialog({
                title: 'Execute ' + command + '?',
                // body: '',
                // focusNodeSelector: 'input',
                buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Ok' })]
              }).then(result => {
                if (result.button.label === 'CANCEL') {
                  return;
                }

                let folder = browser.defaultBrowser.model.path || '';
                const widget = app.shell.currentWidget;
                const context = docManager.contextForWidget(app.shell.currentWidget);

                let path = '';
                let model = {};
                if(context){
                  path = context.path; 
                  model = context.model.toJSON();
                }

                console.log(widget);
                console.log(context);

                return new Promise(function(resolve) {
                  var xhr = new XMLHttpRequest();
                  xhr.open("POST", PageConfig.getBaseUrl() + "commands/run?command=" + encodeURI(command), true);
                  xhr.onload = function (e:any) {
                    if (xhr.readyState === 4) {
                      if (xhr.status === 200) {
                        let resp = JSON.parse(xhr.responseText);
                        let body = '';
                        if(resp){
                          body = resp['body']; 
                        }
                        showDialog({
                            title: 'Execute ' + command + ' succeeded',
                            body: body,
                            // focusNodeSelector: 'input',
                            buttons: [Dialog.okButton({ label: 'Ok' })]
                          }).then(() => {resolve();})
                      } else {
                        showDialog({
                            title: 'Execute ' + command + ' failed',
                            // body: '',
                            // focusNodeSelector: 'input',
                            buttons: [Dialog.okButton({ label: 'Ok' })]
                          }).then(() => {resolve();})
                      }
                    }
                  };
                  xhr.send(JSON.stringify({'folder': folder, 'path': path, 'model': model}));

                });
              });
            }
          });
          palette.addItem({command: command, category: 'Custom Commands'});
        }

      } else {
        console.error(xhr.statusText);
      }
    }
  }.bind(this);
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);

  console.log('JupyterLab extension jupyterlab_commands is activated!');
};


export default extension;
