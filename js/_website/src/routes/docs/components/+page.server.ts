// @ts-ignore
import docs_json from "../docs.json";
import DocsNav from "../../../components/DocsNav.svelte";

let components = docs_json.docs.components;
let helpers = docs_json.docs.helpers;
let routes = docs_json.docs.routes;
let py_client = docs_json.docs["py-client"];

let events = docs_json.docs.events;
let events_matrix = docs_json.docs.events_matrix;

export async function load() {
	return {
		components,
		helpers,
		routes,
		py_client,
		events,
		events_matrix
	};
}
