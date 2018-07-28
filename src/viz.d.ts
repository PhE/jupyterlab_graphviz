declare module 'viz.js/full.render' {
  export function Module(): any;
  export function render(): any;
}

declare module 'viz.js' {
  export interface IVizOptions {
    /** The URL of the rendering script file to use as a Web Worker. */
    workerURL?: string;
    /** A Worker instance. */
    worker?: Worker;
    /** The Emscripten module function. */
    Module?: () => any;
    /** The render function. */
    render?: () => any;
  }

  export interface IImage {
    path: string;
    width: string;
    height: string;
  }

  export interface IFile {
    path: string;
    data: string;
  }

  export type TEngine = 'circo' | 'dot' | 'fdp' | 'neato' | 'osage' | 'twopi';
  export type TFormat =
    | 'dot'
    | 'json'
    | 'json0'
    | 'plain-ext'
    | 'plain'
    | 'ps'
    | 'ps2'
    | 'svg'
    | 'xdot';

  export interface IStringRenderOptions {
    format?: TFormat;
    engine?: TEngine;
    files?: IFile[];
    images?: IImage[];
    yInvert?: boolean;
  }

  export default class Viz {
    constructor(options: IVizOptions);
    renderString(src: string, options: IStringRenderOptions): Promise<string>;
  }

  export interface IViz extends Viz {}
}
