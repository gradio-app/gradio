import docs_json from "../docs.json";
import Demos from '../../../components/Demos.svelte';
import DocsNav from '../../../components/DocsNav.svelte';
import FunctionDoc from '../../../components/FunctionDoc.svelte';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { make_slug_processor } from "../../../utils";

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

export async function load({params}) {
    let name = params.doc;
    let obj;
    let mode;
    let headers = [];
    let method_headers = []
    const get_slug = make_slug_processor();

    for (const key in docs) {
        for (const o in docs[key]) {
            if (docs[key][o].name) {
				docs[key][o].slug = get_slug(docs[key][o].name);
			}

			if (docs[key][o].fns && docs[key][o].fns.length) {
				docs[key][o].fns.forEach((fn) => {
					if (fn.name) fn.slug = get_slug(`${docs[key][o].name} ${fn.name}`);
				});
			}
            if (o == name) {
                obj = docs[key][o];
                mode = key;

                if (obj.name == "Interface") {
                    obj.next_obj = "Flagging"
                } else if (obj.name == "Blocks") {
                    obj.prev_obj = "Combining-Interfaces"
                    obj.next_obj = "Block-Layouts"
                }

                if ("description" in obj) {
                    headers.push(["Description", "description"])
                }
                


                if ("demos" in obj) {
                    obj.demos.forEach(demo => {
                        demo.push(Prism.highlight(demo[1], Prism.languages[language]));
                    })
                }

                if (obj.example) {
                    obj.highlighted_example = Prism.highlight(obj.example, Prism.languages[language]);
                    headers.push(["Example Usage", "example-usage"])
                }
                if (mode === "components") {
                    headers.push(["Behavior", "behavior"])
                }
                if ((obj.parameters.length > 0 && obj.parameters[0].name != "self") || obj.parameters.length > 1) {
                    headers.push(["Initialization", "initialization"])
                }
                if (mode === "components" && obj.string_shortcuts) {
                    headers.push(["Shortcuts", "shortcuts"])
                }

                if ("demos" in obj) {
                    headers.push(["Demos", "demos"])
                }
                

                if ("fns" in obj && obj.fns.length > 0) {
                    headers.push(["Methods", "methods"])
                    for (const fn of obj.fns) {
                        method_headers.push([fn.name, fn.slug])
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
        routes,
        py_client,
        COLOR_SETS,
        headers,
        method_headers
    }

}