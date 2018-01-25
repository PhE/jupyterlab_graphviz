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
import * as d3 from "d3";

import {TYPES} from "./constants";
import {defineGraphvizMode} from "./mode";

//TODO: fix the tsc path error
import "../style/index.css";

defineGraphvizMode();

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

    this.div = document.createElement('div')
    this.div.className = 'jp-graphviz-wrapper';

    this.viz = Viz(`digraph { "loading ..."; }`);
    this.div.innerHTML = this.viz;

    this.node.appendChild(this.div);

    this._zoom = d3.behavior.zoom()
      .on('zoom', () => this.onZoom());

    this._zoom(d3.select(this.div));
  }

  /**
   * Render into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let data = model.data[this._mimeType];

    try {
      this.viz = Viz(data, { engine: this._engine });
    } catch(err) {
      console.groupCollapsed("graphviz error");
      console.error(err);
      console.groupEnd();
    }

    this.div.innerHTML = this.viz;
    this.zoom();

    return Promise.resolve();
  }

  zoom() {
    const div = d3.select(this.div);
    const svg = div.select("svg");

    // right now only using the height, because svg
    const size = [svg.attr("width"), svg.attr("height")].map(parseFloat);
    const tx = this._zoom.translate() || [0, 0];

    // clear out the fixed values
    svg.attr({width: null, height: null, viewBox: null});

    // re-initialize zoom settings
    this._zoom
      .translate((tx[0] || tx[1]) ? tx : [0, size[1]])
      .event(div);
  }

  onZoom() {
    const evt = d3.event as d3.ZoomEvent;
    d3.select(this.div)
      .select("svg g")
      .attr("transform", `translate(${evt.translate}) scale(${evt.scale})`);
  }

  viz: any;
  div: HTMLDivElement;
  private _mimeType: string;
  private _engine: any;
  private _zoom: d3.behavior.Zoom<any>;
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
    id: `jupyterlab.graphviz.${name}`,
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
