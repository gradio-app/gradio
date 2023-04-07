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
let py_client = docs_json.docs["py-client"];


const COLOR_SETS = [
    ["from-green-100", "to-green-50"],
    ["from-yellow-100", "to-yellow-50"],
    ["from-red-100", "to-red-50"],
    ["from-blue-100", "to-blue-50"],
    ["from-pink-100", "to-pink-50"],
    ["from-purple-100", "to-purple-50"],
]


export async function load() {
    let objs = [docs.building.row, 
                docs.building.column, 
                docs.building.tab,
                docs.building.box, 
                docs.building.accordion];

    let headers = [
        ["Row", "row"],
        ["Column", "column"],
        ["Tab", "tab"],
        ["Box", "box"],
        ["Accordion", "accordion"],
    ];
    let method_headers = [];

    for (let obj of objs) {
        if ("demos" in obj) {
            obj.demos.forEach(demo => {
                demo.push(Prism.highlight(demo[1], Prism.languages[language]));
            })
        }
        if (obj.example) {
            obj.highlighted_example = Prism.highlight(obj.example, Prism.languages[language]);
        }

        if ("fns" in obj && obj.fns.length > 0) {
            for (const fn of obj.fns) {
                if (fn.example) {
                    fn.highlighted_example = Prism.highlight(fn.example, Prism.languages[language]);
                }
            }
        }
    }
    let mode = "block-layouts";

    let description = `Customize the layout of your Blocks UI with the layout classes below.`;

    return {
        objs, 
        mode,
        description,
        docs,
        components,
        helpers,
        routes,
        py_client,
        COLOR_SETS,
        headers,
        method_headers
    }

}