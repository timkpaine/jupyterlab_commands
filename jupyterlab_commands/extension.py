import json
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join


class CommandsHandler(IPythonHandler):
    def initialize(self, commands=None):
        self.commands = commands

    def get(self):
        command = self.get_argument('command', '')
        if command in self.commands:
            res = self.commands[command](self.request)
            self.finish(res)
        else:
            self.finish('{}')

    def post(self):
        command = self.get_argument('command', '')
        if command in self.commands:
            res = self.commands[command](self.request)
            self.finish(res)
        else:
            self.finish('{}')


class CommandsListHandler(IPythonHandler):
    def initialize(self, commands=None):
        self.commands = commands

    def get(self):
        self.finish(json.dumps(list(self.commands.keys())))


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    commands = nb_server_app.config.get('JupyterLabCommands', {}).get('commands', {})

    base_url = web_app.settings['base_url']

    host_pattern = '.*$'
    print(base_url)
    print('Installing jupyterlab_commands handler on path %s' % url_path_join(base_url, 'commands/get'))

    print('Available commands: %s' % ','.join(k for k in commands))
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'commands/get'), CommandsListHandler, {'commands': commands})])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'commands/run'), CommandsHandler, {'commands': commands})])
