import * as VizModuleType from 'viz.js';
let _viz: VizModuleType.IViz;

export async function dotToSVG(...args: any[]) {
  if (!_viz) {
    const vizMod = (await import(/* webpackChunkName: "vizjs" */ 'viz.js')) as typeof VizModuleType;
    _viz = new vizMod.default({});
  }
  return _viz.renderString(args[0] as string, {});
}
