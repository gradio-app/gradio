import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { redirects } from "./src/routes/redirects.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mdsvex, code_highlighter } from "mdsvex";
import slugify from "@sindresorhus/slugify";
import { toString as to_string } from "hast-util-to-string";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
let version = "4.0.0";

const get_version = async () => {
	try {
		const versionPath = path.join(
			currentDir,
			"src",
			"lib",
			"json",
			"version.json"
		);
		if (!fs.existsSync(versionPath)) {
			console.error(
				"Using fallback version 4.0.0 as version.json was not found. Run `generate_jsons/generate.py` to get the latest version."
			);
			return version;
		} else {
			const versionData = fs.readFileSync(versionPath, "utf8");
			const versionJson = JSON.parse(versionData);
			version = versionJson.version;
		}
	} catch (error) {
		console.error(
			"Using fallback version 4.0.0 as version.json was not found. Run `generate_jsons/generate.py` to get the latest version."
		);
	}
	return version;
};

get_version();

export function make_slug_processor() {
	return function (name) {
		const slug = slugify(name, { separator: "-", lowercase: true });
		return slug;
	};
}
const doc_slug = [];
function plugin() {
	const get_slug = make_slug_processor();
	return function transform(tree) {
		tree.children.forEach((n) => {
			if (n.type === "element" && ["h3"].includes(n.tagName)) {
				const str_of_heading = to_string(n);
				const slug = get_slug(str_of_heading);

				doc_slug.push({
					text: str_of_heading,
					href: `#${slug}`,
					level: parseInt(n.tagName.replace("h", ""))
				});

				if (!n.children) n.children = [];
				n.properties.className = ["group", "header-tag"];
				n.properties.id = [slug];
				n.children.push({
					type: "element",
					tagName: "a",
					properties: {
						href: `#${slug}`,
						className: ["invisible", "group-hover-visible"]
					},
					children: [
						{
							type: "element",
							tagName: "img",
							properties: {
								src: "https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/anchor.svg",
								className: ["anchor-img-small"]
							},
							children: []
						}
					]
				});
			}
		});
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ".svx"],
	preprocess: [
		mdsvex({
			extensions: [".svx"],
			rehypePlugins: [plugin],
			highlight: {
				highlighter: async (code, lang) => {
					const h = (await code_highlighter(code, lang, "")).replace(
						/\{@html `|`\}/g,
						""
					);
					return `<div class="codeblock"><CopyButton content={\`${code}\`}/>${h}</div>`;
				}
			}
		}),
		vitePreprocess()
	],
	kit: {
		prerender: {
			crawl: true,
			entries: [
				"*",
				`/${version}/docs`,
				`/${version}/guides`,
				`/main/docs`,
				`/main/guides`,
				`/docs/js`,
				`/docs/js/storybook`,
				`/docs/js/`,
				`/main/docs/js`,
				`/main/docs/js/storybook`,
				`/main/docs/js/`,
				...Object.keys(redirects),
				`/4.44.1/docs`,
				`/4.44.1/guides`
			],
			handleMissingId: "warn"
		},
		files: {
			lib: "src/lib"
		},
		adapter: adapter({
			fallback: "404.html"
		}),
		paths: {
			relative: false
		}
	}
};

export default config;
