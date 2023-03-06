import docs_json from "../docs.json";
import Demos from '../../../components/Demos.svelte';
import DocsNav from '../../../components/DocsNav.svelte';
import FunctionDoc from '../../../components/FunctionDoc.svelte';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

let language = 'python';

let docs = docs_json.docs;
let components = docs_json.docs.components;
let helpers = docs_json.docs.helpers;
let routes = docs_json.docs.routes;

export async function load() {
    let objs = [docs.building.simplecsvlogger, 
                docs.building.csvlogger, 
                docs.building.huggingfacedatasetsaver];
    let mode = "flagging";

    let description = `A Gradio Interface includes a 'Flag' button that appears underneath the output. By default, clicking on the Flag button sends the input and output data back to the machine where the gradio demo is running, and saves it to a CSV log file. But this default behavior can be changed. To set what happens when the Flag button is clicked, you pass an instance of a subclass of <em>FlaggingCallback</em> to the <em>flagging_callback</em> parameter in the <em>Interface</em> constructor. You can use one of the <em>FlaggingCallback</em> subclasses that are listed below, or you can create your own, which lets you do whatever you want with the data that is being flagged.`

    return {
        objs, 
        mode,
        description,
        docs,
        components,
        helpers,
        routes
    }

}