import docs_json from "../docs.json";
import DocsNav from '../../../components/DocsNav.svelte';

let components = docs_json.docs.components;
let helpers = docs_json.docs.helpers;
let routes = docs_json.docs.routes;
let py_client = docs_json.docs["py-client"];
let ordered_events = docs_json.docs.ordered_events;

export async function load() {

    return {
        components,
        helpers,
        routes,
        py_client,
        ordered_events
    }

}