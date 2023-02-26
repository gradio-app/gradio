import guides_json from "../routes/guides/guides.json";
let guides = guides_json.guides;

export function match(value) {
    return guides.some((guide) => guide.name === value);
}
