import docs_json from "./docs.json";

let docs: { [key: string]: any } = docs_json.docs;

export function get_object(name: string) {
	let obj: any;
	if (name === "events" || name === "events_matrix") {
		obj = docs["gradio"][name];
		return obj;
	}
	for (const library in docs) {
		for (const key in docs[library]) {
			if (key === name && key !== "chatinterface") {
				obj = docs[library][key];
				break;
			} else {
				for (const o in docs[library][key]) {
					if (o === name) {
						obj = docs[library][key][o];
						break;
					}
				}
			}
		}
	}
	return obj;
}
