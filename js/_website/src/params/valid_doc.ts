import docs_json from "../routes/[[version]]/docs/docs.json";
let docs = docs_json;

export function match(value: string) {
	return docs.pages.some((p: string) => p === value);
}
