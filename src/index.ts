/*-----------------------------------------------------------------------------
| Copyright (c) Philippe Entzmann
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';

import * as Viz from "viz.js";

//TODO: fix the tsc path error
//import "../style/index.css";

// cf https://www.iana.org/assignments/media-types/text/vnd.graphviz
const TYPES: {[key: string]: {name: string, extensions: string[], engine: any}} = {
  'application/vnd.graphviz': {
    name: 'dot',
    extensions: ['.gv', '.dot'],
    engine: 'dot'
  }
};

/**
 * A widget for rendering data, for usage with rendermime.
 */
export
class RenderedData extends Widget implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering Vega/Vega-Lite.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this._engine = TYPES[this._mimeType].engine;
    this.addClass('jp-graphviz');
    this.div = document.createElement('div');
    //(<any>window).Viz = Viz;

    this.viz = Viz(`digraph { "loading ..."; }`);
    this.div.innerHTML = this.viz;
    //console.log(this.viz);


    this.node.appendChild(this.div);
  }

  /**
   * Render into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let data = model.data[this._mimeType];
    //this._resetWidth();
    this.viz = Viz(data);
    //result = Viz("graph { n0 -- n1 -- n2 -- n3 -- n0; }", { engine: "neato" });
    this.div.innerHTML = this.viz;
    return Promise.resolve();
  }

  viz: any;
  div: any;
  private _mimeType: string;
  private _engine: any;
}

/**
 * A mime renderer factory for data.
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: Object.keys(TYPES),
  createRenderer: options => new RenderedData(options)
};

const extensions = Object.keys(TYPES).map(k => {
  const name = TYPES[k].name;
  return {
    name,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [{
      name,
      extensions: TYPES[k].extensions,
      mimeTypes: [k]
    }],
    documentWidgetFactoryOptions: {
      name,
      primaryFileType: name,
      fileTypes: [name],
      defaultFor: [name],
    }
  } as IRenderMime.IExtension;
});

export default extensions;
