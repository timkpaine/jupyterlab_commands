# jupyterlab_commands

Support for arbitrary python commands in the command palette. 

[![Build Status](https://github.com/timkpaine/jupyterlab_commands/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/timkpaine/jupyterlab_commands/actions?query=workflow%3A%22Build+Status%22)
[![codecov](https://codecov.io/gh/timkpaine/jupyterlab_commands/branch/main/graph/badge.svg?token=wWAQ6QqP6M)](https://codecov.io/gh/timkpaine/jupyterlab_commands)
[![PyPI](https://img.shields.io/pypi/l/jupyterlab_commands.svg)](https://pypi.python.org/pypi/jupyterlab_commands)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab_commands.svg)](https://pypi.python.org/pypi/jupyterlab_commands)
[![npm](https://img.shields.io/npm/v/jupyterlab_commands.svg)](https://www.npmjs.com/package/jupyterlab_commands)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/timkpaine/jupyterlab_commands/main?urlpath=lab)

## About

This code lets you inject arbitrary commands into the JLab frontend. There are a variety of reasons why one might want to execute python commands outside of a notebook and a console:

- a predefined NBConvert function that you dont want included in the converted result
- interacting with VCS without including that interaction in the notebook
- etc...

## Installation
```
pip install jupyterlab_commands
jupyter labextension install jupyterlab_commands
jupyter serverextension enable --py jupyterlab_commands
```

## Example 

#### jupyter_lab_config.py

```python
def convertMe(request, *args, **kwargs):
    import subprocess, tornado, os, os.path, json
    data = json.loads(tornado.escape.json_decode(request.body))
    path = os.path.join(os.getcwd(), data['path'])
    subprocess.run(["jupyter", "nbconvert", path, '--to', 'html'])
    return {'body': 'ok'}

c.JupyterLabCommands.commands = {'sample_command': convertMe}
```

#### command palette

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/main/docs/2.png)

#### terminal log

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/main/docs/3.png)

#### No Code

Moved to [jupyterlab_nbconvert_nocode](https://github.com/timkpaine/jupyterlab_nbconvert_nocode)

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/main/docs/4.png)


## Install

```bash
pip install jupyterlab_commands
jupyter labextension install jupyterlab_commands
jupyter serverextension enable --py jupyterlab_commands
```

## Adding commands

install the server extension, and add the following to `jupyter_notebook_config.py`

```python3
c.JupyterLabCommands.commands = {'command display name': python_function, ...}
```
