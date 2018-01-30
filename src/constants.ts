// cf https://www.iana.org/assignments/media-types/text/vnd.graphviz
export const TYPES: {[key: string]: {name: string, extensions: string[], engine: any}} = {
  'application/vnd.graphviz': {
    name: 'dot',
    extensions: ['.gv', '.dot'],
    engine: 'dot'
  },
  'application/vnd.graphviz.neato': {
    name: 'neato',
    extensions: ['.neato'],
    engine: 'neato'
  }
};


export const GRAPHVIZ_CLASS = 'jp-graphviz';
export const GRAPHVIZ_TOOLS_CLASS = 'jp-graphviz-tools';
export const GRAPHVIZ_GRAPH_CLASS = 'jp-graphviz-graph';
