import guides_json from "../guides/guides.json";
import { compile } from 'mdsvex';



let guides = guides_json.guides;
let guides_by_category = guides_json.guides_by_category;
// let guide;


export async function load() {
    for (const guide of guides) {
        const compiled = await compile(guide.content,
            {});
        guide.new_html = await compiled.code;
    }

    return {
        guides
    }
}