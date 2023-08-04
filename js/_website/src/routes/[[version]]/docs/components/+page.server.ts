import docs_json from "../docs.json";

let components = docs_json.docs.components;
let helpers = docs_json.docs.helpers;
let routes = docs_json.docs.routes;
let py_client = docs_json.docs["py-client"];

let events = docs_json.docs.events;
let events_matrix = docs_json.docs.events_matrix;

export async function load({ params }: { params: any }) {
	console.log(params);
	return {
		components,
		helpers,
		routes,
		py_client,
		events,
		events_matrix
	};
}
