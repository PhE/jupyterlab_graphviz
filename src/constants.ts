// cf https://www.iana.org/assignments/media-types/text/vnd.graphviz
export const TYPES: {
  [key: string]: {name: string; extensions: string[]; engine: any};
} = {
  'text/vnd.graphviz': {
    name: 'dot',
    extensions: ['.gv', '.dot', '.neato'],
    engine: 'dot',
  },
};

export const GRAPHVIZ_CLASS = 'jp-graphviz';
export const GRAPHVIZ_TOOLS_CLASS = 'jp-graphviz-tools';
export const GRAPHVIZ_GRAPH_CLASS = 'jp-graphviz-graph';
export const GRAPHVIZ_CENTER_PAD = 0.95;
