import changelog_json from "./changelog.json";
import { compile } from 'mdsvex';
let content = changelog_json.content;
let versions = changelog_json.versions;

export async function load() {
    const compiled = await compile(content, {});
    content = await compiled.code;

    return {
        content, 
        versions
    }
}