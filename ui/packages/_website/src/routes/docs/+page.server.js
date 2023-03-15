import docs_json from "./docs.json";
import Demos from '../../components/Demos.svelte';
import DocsNav from '../../components/DocsNav.svelte';
import FunctionDoc from '../../components/FunctionDoc.svelte';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import { make_slug_processor } from "../../utils";

let language = 'python';

let docs = docs_json.docs;
let components = docs_json.docs.components;
let helpers = docs_json.docs.helpers;
let routes = docs_json.docs.routes;

const COLOR_SETS = [
    ["from-green-100", "to-green-50"],
    ["from-yellow-100", "to-yellow-50"],
    ["from-red-100", "to-red-50"],
    ["from-blue-100", "to-blue-50"],
    ["from-pink-100", "to-pink-50"],
    ["from-purple-100", "to-purple-50"],
]


export async function load() {
	let name = "interface";
	let obj;
	let mode;

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

            if (docs[key][o].demos) {
                docs[key][o].demos.forEach(demo => {
                    demo.push(Prism.highlight(demo[1], Prism.languages[language]));
                })
            }
            if (docs[key][o].example) {
                docs[key][o].highlighted_example = Prism.highlight(docs[key][o].example, Prism.languages[language]);
            }

            if (docs[key][o].fns && docs[key][o].fns.length > 0) {
                for (const fn of docs[key][o].fns) {
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
        COLOR_SETS
    }

}