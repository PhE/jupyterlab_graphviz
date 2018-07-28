# jupyterlab_graphviz

> A JupyterLab extension for interactively viewing [Graphviz](https://www.graphviz.org) data
files, powered by [viz.js](https://github.com/mdaines/viz.js/).

![Screenshot](hello.png)

## Editing and viewing DOT language files
Right-click on a supported file in the **Files** sidebar
and choose **Open with... ▶ dot**.

The following [DOT language](https://www.graphviz.org/doc/info/lang.html) file
extensions are supported with live preview and syntax highlighting:
- `.gv`
- `.dot`
- `.neato`

## Inline rendering
The following MIME type can also be rendered inline in Notebooks and Consoles:
- `text/vnd.graphviz`

> Check out some MIME examples in the
[Cookbook](./samples/Graphviz Rich Display Cookbook.ipynb).

## Pan and zoom
File-based and inline diagrams can be panned by clicking and dragging. Use a
mouse wheel, double click or the **Zoom** slider. `Shift` and double click zooms out.

## Text Search in Diagrams
Diagrams are rendered directly as SVG elements, so normal browser search can
find text.

## Installation
> ### Prerequisites
* [JupyterLab](https://github.com/jupyterlab/jupyterlab) ≥ 0.33
* [nodejs](https://nodejs.org/en/) ≥ 6,<10

> For example, via `conda`:
```bash
conda install -c conda-forge jupyterlab=0.33 nodejs=8
```

```bash
jupyter labextension install jupyterlab_graphviz
```


## Development

### Quick start
Gets you started with a clean, linted, build JupyterLab with the extension
```bash
jlpm bootstrap
```

#### Install dependencies
```bash
jlpm bootstrap
```

#### Build the extension
```bash
jlpm build
```

### Install into to my JupyterLab
```bash
jlpm lab:link
```

### Rebuild once
To rebuild the package and the JupyterLab app:

```bash
jlpm build
jlpm lab:build
```

### Develop continuously
```bash
jlpm watch
# and in another terminal
jlpm lab:watch
```

### Check and apply project style
```bash
jlpm lint
```

## TODO
* add tests
* add _Save as..._
* build bundle for nbviewer
