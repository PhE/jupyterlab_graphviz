/**
 * This file exists as a target for `require.ensure` so that the 2MB worker
 * isn't loaded until an actual render is requested.
 */

import Viz from 'viz.js';
import VizWorker from 'worker-loader!viz.js/full.render';

/** Expose or create the singleton */
export function viz() {
  if (Private.viz == null) {
    Private.viz = new Viz({worker: new (VizWorker as any)()});
  }
  return Private.viz;
}

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * A cached reference to the viz.js worker.
   */
  export let viz: Viz;
}
