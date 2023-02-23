import json
import tornado.web
from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.utils import url_path_join


class CommandsHandler(JupyterHandler):
    def initialize(self, commands=None):
        self.commands = commands

    @tornado.web.authenticated
    def get(self):
        command = self.get_argument("command", "")
        if command in self.commands:
            res = self.commands[command](self.request)
            self.finish(res)
        else:
            self.finish("{}")

    @tornado.web.authenticated
    def post(self):
        command = self.get_argument("command", "")
        if command in self.commands:
            res = self.commands[command](self.request)
            self.finish(res)
        else:
            self.finish("{}")


class CommandsListHandler(JupyterHandler):
    def initialize(self, commands=None):
        self.commands = commands

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps(list(self.commands.keys())))


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    commands = nb_server_app.config.get("JupyterLabCommands", {}).get("commands", {})

    base_url = web_app.settings["base_url"]

    host_pattern = ".*$"
    nb_server_app.log.info(
        "Installing jupyterlab_commands handler on path %s"
        % url_path_join(base_url, "commands")
    )

    nb_server_app.log.info("Available commands: %s" % ",".join(k for k in commands))
    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(base_url, "commands/get"),
                CommandsListHandler,
                {"commands": commands},
            )
        ],
    )
    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(base_url, "commands/run"),
                CommandsHandler,
                {"commands": commands},
            )
        ],
    )
