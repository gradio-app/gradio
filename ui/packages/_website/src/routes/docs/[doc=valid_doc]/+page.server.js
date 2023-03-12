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

export async function load({params}) {
    let name = params.doc;
    let obj;
    let mode;
    for (const key in docs) {
        for (const o in docs[key]) {
            if (o == name) {
                obj = docs[key][o];
                mode = key;

                if (obj.name == "Interface") {
                    obj.next_obj = "Flagging"
                } else if (obj.name == "Blocks") {
                    obj.prev_obj = "Combining-Interfaces"
                    obj.next_obj = "Block-Layouts"
                }

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
        }
    }

    return {
        name, 
        obj, 
        mode,
        docs,
        components,
        helpers,
        routes
    }

}