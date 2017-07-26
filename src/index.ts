import {
  JupyterLabPlugin
} from '@jupyterlab/application';


import * as Viz from "viz.js";
import * as BpmnViewer from "bpmn-js";

/**
 * Initialization data for the jupyterlab_myext extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_myext',
  autoStart: true,
  activate: (app) => {
    console.log('JupyterLab extension jupyterlab_myext is activated!');
    console.log('DBG 4');
    //window["philippe"] = 'Hello !';
    (<any>window).philippe = "Something";
    (<any>window).Viz = Viz;
    //var viewer = new BpmnViewer({ container: 'body' });
    (<any>window).BpmnViewer = BpmnViewer;

    console.log('DBG 4b');
    console.log(Viz);
    console.log(Viz("digraph { a -> b; }"));
  }
};

export default extension;
