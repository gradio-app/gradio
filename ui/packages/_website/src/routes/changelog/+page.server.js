import changelog_json from "./changelog.json";
import { compile } from 'mdsvex';
let content = changelog_json.content;
let versions = changelog_json.versions;
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csv";
import "prismjs/components/prism-markup";

const langs = {
	python: "python",
	py: "python",
	bash: "bash",
	csv: "csv",
	html: "html",
	shell: "bash",
	json: "json",
	typescript: "typescript",
	directory: "json",
};

function highlight(code, lang) {
	const _lang = langs[lang] || "";

	console.log(code, lang, _lang);
	const highlighted = _lang
		? `<pre class="language-${lang}"><code>${Prism.highlight(
				code,
				Prism.languages[_lang],
				_lang
		  )}</code></pre>`
		: code;

	return highlighted;
}

export async function load() {
    const compiled = await compile(content, {
        highlight: {
            highlighter: highlight
        }
    });
    content = await compiled.code;

    return {
        content, 
        versions
    }
}