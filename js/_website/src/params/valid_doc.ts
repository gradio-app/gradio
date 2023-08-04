import docs_json from "$lib/json/docs.json";
let docs = docs_json;

export function match(value: string) {
	return docs.pages.some((p: string) => p === value);
}
