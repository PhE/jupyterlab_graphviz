let _Viz: any;

export async function Viz(...args: any[]) {
  if (!_Viz) {
    _Viz = await import(/* webpackChunkName: "vizjs" */ 'viz.js');
  }
  return _Viz(...args);
}
