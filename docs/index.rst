jupyterlab_commands
===================

Support for arbitrary python commands in the command palette.

|Build Status| |GitHub issues| |codecov| |PyPI| |PyPI| |npm|

About
-----

This code lets you inject arbitrary commands into the JLab frontend.
There are a variety of reasons why one might want to execute python
commands outside of a notebook and a console:

-  a predefined NBConvert function that you dont want included in the
   converted result
-  interacting with VCS without including that interaction in the
   notebook
-  etc…

Example
-------

jupyter_notebook_config.py
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code:: python

   def convertMe(request, *args, **kwargs):
       import subprocess
       import tornado
       import os
       import os.path
       import json
       data = json.loads(tornado.escape.json_decode(request.body))
       path = os.path.join(os.getcwd(), data['path'])
       print(path)
       print(path)
       print(path)
       print(path)
       print(path)
       subprocess.run(["jupyter", "nbconvert", path, '--template', '/Users/theocean154/.jupyter/test.tpl', '--to', 'html'])
       return {'body': 'testing'}

   c.JupyterLabCommands.commands = {'sample_command': convertMe}

command palette
^^^^^^^^^^^^^^^

|image6|

terminal log
^^^^^^^^^^^^

|image7|

Install
-------

.. code:: bash

   pip install jupyterlab_commands
   jupyter labextension install jupyterlab_commands
   jupyter serverextension enable --py jupyterlab_commands

Adding commands
---------------

install the server extension, and add the following to
``jupyter_notebook_config.py``

.. code:: python3

   c.JupyterLabCommands.commands = {'command display name': python_function, ...}

.. |Build Status| image:: https://travis-ci.org/timkpaine/jupyterlab_commands.svg?branch=master
   :target: https://travis-ci.org/timkpaine/jupyterlab_commands
.. |GitHub issues| image:: https://img.shields.io/github/issues/timkpaine/jupyterlab_commands.svg
   :target: 
.. |codecov| image:: https://codecov.io/gh/timkpaine/jupyterlab_commands/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/timkpaine/jupyterlab_commands
.. |PyPI| image:: https://img.shields.io/pypi/l/jupyterlab_commands.svg
   :target: https://pypi.python.org/pypi/jupyterlab_commands
.. |PyPI| image:: https://img.shields.io/pypi/v/jupyterlab_commands.svg
   :target: https://pypi.python.org/pypi/jupyterlab_commands
.. |npm| image:: https://img.shields.io/npm/v/jupyterlab_commands.svg
   :target: https://www.npmjs.com/package/jupyterlab_commands
.. |image6| image:: https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/master/docs/2.png
.. |image7| image:: https://raw.githubusercontent.com/timkpaine/jupyterlab_commands/master/docs/3.png

