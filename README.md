# jupyterlab_commands
Support for arbitrary python commands in the command palette. 

[![Build Status](https://dev.azure.com/tpaine154/jupyter/_apis/build/status/timkpaine.jupyterlab_commands?branchName=master)](https://dev.azure.com/tpaine154/jupyter/_build/latest?definitionId=14&branchName=master)
[![GitHub issues](https://img.shields.io/github/issues/timkpaine/jupyterlab_commands.svg)]()
[![Coverage](https://img.shields.io/azure-devops/coverage/tpaine154/jupyter/14/master)](https://dev.azure.com/tpaine154/jupyter/_build?definitionId=14&_a=summary)
[![PyPI](https://img.shields.io/pypi/l/jupyterlab_commands.svg)](https://pypi.python.org/pypi/jupyterlab_commands)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab_commands.svg)](https://pypi.python.org/pypi/jupyterlab_commands)
[![npm](https://img.shields.io/npm/v/jupyterlab_commands.svg)](https://www.npmjs.com/package/jupyterlab_commands)

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
#### jupyter_notebook_config.py
```python
def convertMe(request, *args, **kwargs):
    import subprocess, tornado, os, os.path, json
    data = json.loads(tornado.escape.json_decode(request.body))
    path = os.path.join(os.getcwd(), data['path'])
    subprocess.run(["jupyter", "nbconvert", path, '--template', '/Users/theocean154/.jupyter/test.tpl', '--to', 'html'])
    return {'body': 'ok'}

c.JupyterLabCommands.commands = {'sample_command': convertMe}
```

#### command palette
![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/master/docs/2.png)

#### terminal log
![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/master/docs/3.png)

#### No Code
![](https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/master/docs/4.png)


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
