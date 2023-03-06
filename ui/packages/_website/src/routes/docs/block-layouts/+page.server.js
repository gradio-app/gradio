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
    let objs = [docs.building.row, 
                docs.building.column, 
                docs.building.tab,
                docs.building.box, 
                docs.building.accordion];
    let mode = "block-layouts";

    let description = `Customize the layout of your Blocks UI with the layout classes below.`;

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