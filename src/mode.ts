import * as CodeMirror from 'codemirror';

import 'codemirror/addon/mode/simple';

import {TYPES} from "./constants";

export const MODE_NAME = 'Graphviz';

const ALL_ATTRS = [
  "Damping", "K", "URL", "_background", "area", "arrowhead", "arrowsize", "arrowtail", "bb", "bgcolor", "center", "charset", "clusterrank", "color", "colorscheme", "comment", "compound", "concentrate", "constraint", "decorate", "defaultdist", "dim", "dimen", "dir", "diredgeconstraints", "distortion", "dpi", "edgeURL", "edgehref", "edgetarget", "edgetooltip", "epsilon", "esep", "fillcolor", "fixedsize", "fontcolor", "fontname", "fontnames", "fontpath", "fontsize", "forcelabels", "gradientangle", "group", "headURL", "head_lp", "headclip", "headhref", "headlabel", "headport", "headtarget", "headtooltip", "height", "href", "id", "image", "imagepath", "imagepos", "imagescale", "inputscale", "label", "labelURL", "label_scheme", "labelangle", "labeldistance", "labelfloat", "labelfontcolor", "labelfontname", "labelfontsize", "labelhref", "labeljust", "labelloc", "labeltarget", "labeltooltip", "landscape", "layer", "layerlistsep", "layers", "layerselect", "layersep", "layout", "len", "levels", "levelsgap", "lhead", "lheight", "lp", "ltail", "lwidth", "margin", "maxiter", "mclimit", "mindist", "minlen", "mode", "model", "mosek", "newrank", "nodesep", "nojustify", "normalize", "notranslate", "nslimit", "nslimit1", "ordering", "orientation", "orientation", "outputorder", "overlap", "overlap_scaling", "overlap_shrink", "pack", "packmode", "pad", "page", "pagedir", "pencolor", "penwidth", "peripheries", "pin", "pos", "quadtree", "quantum", "rank", "rankdir", "ranksep", "ratio", "rects", "regular", "remincross", "repulsiveforce", "resolution", "root", "rotate", "rotation", "samehead", "sametail", "samplepoints", "scale", "searchsize", "sep", "shape", "shapefile", "showboxes", "sides", "size", "skew", "smoothing", "sortv", "splines", "start", "style", "stylesheet", "tailURL", "tail_lp", "tailclip", "tailhref", "taillabel", "tailport", "tailtarget", "tailtooltip", "target", "tooltip", "truecolor", "vertices", "viewport", "voro_margin", "weight", "width", "xdotversion", "xlabel", "xlp", "z"
];


const STATES = {
  start: [
    {regex: /'.*?'|".*?"/, token: "string"},
    {regex: /-+>?|=|:/, token: "operator"},
    {regex: /[;,]/, token: "comment"},
    {regex: /[{}[\]]/, token: "bracket"},
    {regex: /graph|digraph|strict|node|edge|subgraph/i,
     token: "atom"},
    {regex: `\b(${ALL_ATTRS.join("|")})\b`, token: "property"},
    {regex: /</, token: "meta", mode: {spec: "xml", end: />>/}},
    {regex: /#.*/, token: "comment"},
    {regex: /[a-z][a-z\d_]*/i, token: "variable"},
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
     token: "number"},
    {regex: /\/\*/, token: "comment", next: "comment"},
  ],
  // The multi-line comment state.
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
};

export function defineGraphvizMode() {
  (CodeMirror as any).defineSimpleMode(MODE_NAME, STATES);

  for(let t in TYPES) {
    CodeMirror.defineMIME(t, MODE_NAME);
    CodeMirror.modeInfo.push({
      // codemirror extensions don't expect the leading dot
      ext: TYPES[t].extensions.map((e) => e.replace(/^./, '')),
      mime: t,
      mode: MODE_NAME,
      name: `${MODE_NAME} (${TYPES[t].name})`,
    });
  }
}
