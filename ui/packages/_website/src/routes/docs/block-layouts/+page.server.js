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
        routes
    }

}