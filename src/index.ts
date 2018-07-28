/*-----------------------------------------------------------------------------
| Copyright (c) Philippe Entzmann
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
// tslint:disable
/// <reference path="../node_modules/@types/webpack-env/index.d.ts"/>
// tslint:enable

import {IRenderMime} from '@jupyterlab/rendermime-interfaces';

import {Widget} from '@phosphor/widgets';

import {Message} from '@phosphor/messaging';

import * as d3 from 'd3';

import * as VizModuleType from 'viz.js';
import * as VizWrapModuleType from './viz-wrap';

import * as C from './constants';
import {defineGraphvizMode} from './mode';

import '../style/index.css';

defineGraphvizMode();

/**
 * A widget for rendering graphviz/dot, for usage with rendermime.
 */
export class RenderedGraphviz extends Widget implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering graphviz/dot as an image
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this._engine = C.TYPES[this._mimeType].engine;

    const root = d3.select(this.node).classed(C.GRAPHVIZ_CLASS, true);

    this._div = root.append('div').classed(C.GRAPHVIZ_GRAPH_CLASS, true);

    this._zoom = d3.zoom().on('zoom', () => this.onZoom());

    this._div.call(this._zoom);
  }

  get g() {
    return this.svg.select('g');
  }

  get svg() {
    return d3.select(this.node).select('svg');
  }

  async draw(graphviz: string = null, options = {}) {
    const viz = Private.viz != null ? Private.viz : await Private.ensureViz();

    if (!graphviz && !this._lastRaw) {
      return Promise.resolve();
    }

    graphviz = graphviz || this._lastRaw;

    let cleaned: string = graphviz;

    if (cleaned === this._lastRender) {
      return Promise.resolve();
    }

    let svg: string;

    try {
      svg = await viz.renderString(cleaned, {engine: this._engine});
    } catch (err) {
      console.groupCollapsed('graphviz error');
      console.error(err);
      console.groupEnd();
      return;
    }

    this._lastRender = cleaned;
    this._lastRaw = graphviz;
    this.viz = svg
      .replace(/ id="[^"]+"/g, ' ')
      .replace(/ class="(node|edge|cluster)"/g, ' class="jp-graphviz-$1"');

    this._div.html(this.viz);

    const {width, height} = options as any;

    this.svg
      .style(
        'min-width',
        width ? `${width}` : this._lastSize ? this._lastSize[0] : null
      )
      .style(
        'min-height',
        height ? `${height}` : this._lastSize ? this._lastSize[1] : null
      );
  }

  /**
   * Render into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as string;
    const metadata = model.metadata;

    return this.draw(data, metadata);
  }

  onAfterAttach(msg: Message) {
    super.onAfterAttach(msg);
    this._div.call(this._zoom);
  }

  stripIds() {
    this.svg.selectAll('*[id]').attr('id', null);
  }

  onZoom() {
    const evt = (this._lastZoom = d3.event as d3.D3ZoomEvent<SVGElement, any>);
    const tx = evt && evt.transform;

    if (tx == null || isNaN(tx.x) || isNaN(tx.y) || isNaN(tx.k)) {
      return;
    }

    this._div
      .select('svg')
      .attr('transform-origin', 'top left')
      .attr('transform', d3.event.transform);
  }

  viz: any;
  private _div: d3.Selection<any, any, any, any>;
  private _mimeType: string;
  private _engine: any;
  private _zoom: d3.ZoomBehavior<any, any>;
  private _lastRender = '';
  private _lastRaw = '';
  private _lastSize: [number, number];
  private _lastZoom: d3.D3ZoomEvent<any, any>;
}

/**
 * A mime renderer factory for data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: Object.keys(C.TYPES),
  createRenderer: (options) => new RenderedGraphviz(options),
};

const extensions = Object.keys(C.TYPES).map((k) => {
  const name = C.TYPES[k].name;
  return {
    id: `jupyterlab.graphviz.${name}`,
    name,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [
      {
        name,
        extensions: C.TYPES[k].extensions,
        mimeTypes: [k],
      },
    ],
    documentWidgetFactoryOptions: {
      name,
      primaryFileType: name,
      fileTypes: [name],
      defaultFor: [name],
    },
  } as IRenderMime.IExtension;
});

export default extensions;

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * A cached reference to the viz.js library.
   */
  export let viz: VizModuleType.IViz;

  /**
   * A Promise for the initial load of viz.js Viz singleton
   */
  export let vizReady: Promise<VizModuleType.IViz>;

  /**
   * Lazy-load and cache the viz.js Viz singleton
   */
  export function ensureViz(): Promise<VizModuleType.IViz> {
    if (vizReady) {
      return vizReady;
    }

    vizReady = new Promise((resolve, reject) => {
      require.ensure(
        ['./viz-wrap'],
        // see https://webpack.js.org/api/module-methods/#require-ensure
        // this argument MUST be named `require` for the WebPack parser
        (require) => {
          viz = (require('./viz-wrap') as typeof VizWrapModuleType).viz();
          resolve(viz);
        },
        (error: any) => {
          console.error(error);
          reject();
        },
        'viz'
      );
    });

    return vizReady;
  }
}
