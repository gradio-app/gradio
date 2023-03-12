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
                if ("demos" in obj) {
                    obj.demos.forEach(demo => {
                        demo.push(Prism.highlight(demo[1], Prism.languages[language]));
                    })
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