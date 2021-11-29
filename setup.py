from setuptools import setup, find_packages
from codecs import open
from os import path

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
)

pjoin = path.join

name = "jupyterlab_commands"
here = path.abspath(path.dirname(__file__))
jshere = path.abspath(path.join(here, "js"))
version = get_version(pjoin(here, name, "_version.py"))

with open(path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = f.read().replace("\r\n", "\n")

requires = ["jupyterlab>=3.0.0", "notebook>=6.0.3"]

requires_dev = requires + [
    "black>=20.",
    "bump2version>=1.0.0",
    "flake8>=3.7.8",
    "flake8-black>=0.2.1",
    "jupyter_packaging",
    "mock",
    "pytest>=4.3.0",
    "pytest-cov>=2.6.1",
    "Sphinx>=1.8.4",
    "sphinx-markdown-builder>=0.5.2",
]


data_spec = [
    # Lab extension installed by default:
    (
        "share/jupyter/labextensions/jupyterlab_commands",
        "jupyterlab_commands/labextension",
        "**",
    ),
    # Config to enable server extension by default:
    ("etc/jupyter/jupyter_server_config.d", "jupyter-config", "*.json"),
]


cmdclass = create_cmdclass("js", data_files_spec=data_spec)
cmdclass["js"] = combine_commands(
    install_npm(jshere, build_cmd="build:all"),
    ensure_targets(
        [
            pjoin(jshere, "lib", "index.js"),
            pjoin(jshere, "style", "index.css"),
            pjoin(here, "jupyterlab_commands", "labextension", "package.json"),
        ]
    ),
)


setup(
    name=name,
    version=version,
    description="Arbitrary python commands for notebooks in JupyterLab",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/timkpaine/jupyterlab_commands",
    author="Tim Paine",
    author_email="t.paine154@gmail.com",
    license="Apache 2.0",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
    ],
    cmdclass=cmdclass,
    keywords="jupyter jupyterlab",
    packages=find_packages(
        exclude=[
            "tests",
        ]
    ),
    zip_safe=False,
    extras_require={
        "dev": requires_dev,
    },
    python_requires=">=3.7",
)
