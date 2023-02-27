import docs_json from "../routes/docs/docs.json";
let docs = docs_json;

export function match(value) {
    return Object.keys(docs).some((key) => key === value);
}