from ._version import __version__  # noqa: F401


def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterlab_commands.extension"
    }, {
        "module": "jupyterlab_commands.nbconvert_functions.hideinput.extension",
    }]
