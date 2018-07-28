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

import * as VizModuleType from 'viz.js';
import * as VizFullRenderModel from 'viz.js/full.render';

import * as d3 from 'd3';
// import {drag as d3Drag} from 'd3-drag';

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

    const toolbar = root.append('div').classed(C.GRAPHVIZ_TOOLS_CLASS, true);

    const that = this;

    // const zoomLabel = toolbar.append('label').text('Zoom');

    // this._zoomSlider = zoomLabel
    //   .append('input')
    //   .attr('type', 'range')
    //   .attr('min', 0.0001)
    //   .attr('max', 10)
    //   .attr('step', 0.01)
    //   .on('input', () => {
    //     const value = (d3.event as any).currentTarget.valueAsNumber;
    //     that.zoomLevel = value;
    // });

    const centerLabel = toolbar.append('label').text('Center');

    centerLabel
      .append('input')
      .attr('type', 'checkbox')
      .attr('checked', true)
      .on('change', () => {
        that.autoCenter = (d3.event as any).currentTarget.checked;
      });

    this._zoom = d3
      .zoom()
      // .filter(() => true)
      .on('zoom', () => this.onZoom());

    this._div.call(this._zoom);
  }

  // get zoomLevel() {
  //   return this._lastZoom.transform;
  // }
  //
  // set zoomLevel(zoomLevel) {
  //   this._zoom.scale(zoomLevel).event(this.g);
  // }

  get autoCenter() {
    return this._autoCenter;
  }

  set autoCenter(autoCenter) {
    this._autoCenter = autoCenter;
    if (autoCenter) {
      this.zoomFit();
    }
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

    this.zoom();

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
    this.zoomFit();
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
    this.zoomFit();
  }

  stripIds() {
    this.svg.selectAll('*[id]').attr('id', null);
  }

  onResize(msg: Widget.ResizeMessage) {
    if (this._autoCenter) {
      this.zoomFit(msg.width, msg.height);
    }
  }

  zoom() {
    // const svg = this.svg;
    // const g = this.g;
    //
    // // right now only using the height, because svg
    // const size = (this._lastSize = [svg.attr('width'), svg.attr('height')].map(
    //   parseFloat
    // ) as [number, number]);
    // let tx = this._zoom.translate() || [0, 0];
    // let scale = this._zoom.scale() || 1.0;
    //
    // // clear out the fixed values
    // svg.attr('width', null)
    //   .attr('height', null)
    //   .attr('viewBox', null);
    //
    // tx = this._lastZoom
    //   ? this._lastZoom.translate
    //   : tx[0] || tx[1]
    //     ? tx
    //     : [0, size[1]];
    //
    // scale = this._lastZoom ? this._lastZoom.scale : scale !== 1.0 ? scale : 1.0;
    //
    // this._zoom.translate(tx).scale(scale);
    //
    // g.attr('transform', `translate(${tx}) scale(${scale})`);
    //
    // // re-initialize zoom settings
    // if (this._autoCenter) {
    //   this.zoomFit();
    // } else {
    //   this._zoom.event(g);
    // }
  }

  zoomFit(width: number = null, height: number = null) {
    if (!this._lastSize) {
      return;
    }
    const root = this._div.select('svg g');

    const b =
      width !== null
        ? {width, height}
        : (this._div.node() as HTMLElement).getBoundingClientRect();

    const g = {
      width: this._lastSize[0],
      height: this._lastSize[1],
    };

    if (!(b.width && b.height && g.width && g.height)) {
      return;
    }

    const scale =
      Math.min(b.width / g.width, b.height / g.height) * C.GRAPHVIZ_CENTER_PAD;
    const translate = [
      b.width / 2 - scale * (g.width / 2),
      b.height / 2 + scale * (g.height / 2),
    ] as [number, number];
    console.log('should translate', translate);
    this._zoom.translateTo(root, translate[0], translate[1]);
    this._zoom.scaleTo(root, scale);
    // root.call(this._zoom.translate(translate).scale(scale).event);
    root.call(this._zoom.transform);
  }

  onZoom() {
    const evt = (this._lastZoom = d3.event as d3.D3ZoomEvent<SVGElement, any>);

    if (
      evt == null ||
      isNaN(evt.transform.x) ||
      isNaN(evt.transform.y) ||
      !evt.transform.k
    ) {
      return;
    }

    this._div.select('svg')
      .attr('transform-origin', 'top left')
      .attr('transform', d3.event.transform);
    //
    // this._zoomSlider.property({value: evt.scale});
  }

  viz: any;
  private _div: d3.Selection<any, any, any, any>;
  private _mimeType: string;
  private _engine: any;
  private _zoom: d3.ZoomBehavior<any, any>;
  private _autoCenter = true;
  private _lastRender = '';
  private _lastRaw = '';
  private _lastSize: [number, number];
  private _lastZoom: d3.D3ZoomEvent<any, any>;
  // private _zoomSlider: d3.Selection<any, any, any, any>;
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
   * A Promise for the initial load of viz.js.
   */
  export let vizReady: Promise<VizModuleType.IViz>;

  /**
   * Lazy-load and cache the viz.js library
   */
  export function ensureViz(): Promise<VizModuleType.IViz> {
    if (vizReady) {
      return vizReady;
    }

    vizReady = new Promise((resolve, reject) => {
      require.ensure(
        ['viz.js', 'viz.js/full.render'],
        // see https://webpack.js.org/api/module-methods/#require-ensure
        // this argument MUST be named `require` for the WebPack parser
        (require) => {
          let renderMod = require('viz.js/full.render') as typeof VizFullRenderModel;
          let {Module, render} = renderMod;

          let vizMod = require('viz.js') as typeof VizModuleType;
          viz = new vizMod.default({Module, render});
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
