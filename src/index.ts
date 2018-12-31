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

import {
  request, RequestResult
} from './request';

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
  request('get', PageConfig.getBaseUrl() + "commands/get").then((res: RequestResult)=>{
    if(res.ok){
      let commands = res.json() as [string];
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
                request('post', PageConfig.getBaseUrl() + "commands/run?command=" + encodeURI(command), {}, JSON.stringify({'folder': folder, 'path': path, 'model': model})).then((res: RequestResult)=>{
                  if(res.ok){
                    let resp = res.json() as {[key: string]: string};
                    let body = '';
                    if(resp){
                      body = resp['body']; 
                    }
                    showDialog({
                        title: 'Execute ' + command + ' succeeded',
                        body: body,
                        buttons: [Dialog.okButton({ label: 'Ok' })]
                      }).then(() => {resolve();})
                  } else {
                    showDialog({
                        title: 'Execute ' + command + ' failed',
                        buttons: [Dialog.okButton({ label: 'Ok' })]
                      }).then(() => {resolve();})
                  }
                })

              });
            });
          }
        });
        palette.addItem({command: command, category: 'Custom Commands'});
      }
    }
  });

  console.log('JupyterLab extension jupyterlab_commands is activated!');
};


export default extension;
export {activate as _activate};