import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const template = readFileSync(
	resolve(import.meta.dirname, "../index.html"),
	"utf8"
);
const marker = "const root = {{ config.get('root', '') | toorjson }};";
const marker_index = template.indexOf(marker);
const script_start =
	template.lastIndexOf("<script>", marker_index) + "<script>".length;
const script_end = template.indexOf("</script>", marker_index);

function run_asset_bootstrap(
	root: string,
	is_colab: boolean
): {
	config_root: string;
	script_src: string;
} {
	const code = template
		.slice(script_start, script_end)
		.replace(marker, `const root = ${JSON.stringify(root)};`);
	const script: { src?: string; async?: boolean } = {};
	const fake_window = {
		gradio_config: { is_colab, root },
		location: {
			href: "https://runtime-id-7860.us-central1.colab.googleusercontent.com/",
			hostname: "runtime-id-7860.us-central1.colab.googleusercontent.com",
			origin: "https://runtime-id-7860.us-central1.colab.googleusercontent.com"
		}
	};
	const fake_document = {
		createElement: () => script,
		head: { appendChild: () => undefined }
	};

	new Function("window", "document", code)(fake_window, fake_document);

	return {
		config_root: fake_window.gradio_config.root,
		script_src: script.src ?? ""
	};
}

describe("Colab asset bootstrap", () => {
	test("uses the browser-visible Colab proxy before loading assets", () => {
		const result = run_asset_bootstrap(
			"http://runtime-id.us-central1-b.c.codatalab-user-runtimes.internal:8007",
			false
		);

		expect(result.config_root).toBe(
			"https://runtime-id-7860.us-central1.colab.googleusercontent.com"
		);
		expect(result.script_src).toBe(
			"https://runtime-id-7860.us-central1.colab.googleusercontent.com/static/js/iframeResizer.contentWindow.min.js"
		);
	});

	test("keeps a remote non-Colab root unchanged", () => {
		const result = run_asset_bootstrap("https://remote.example/gradio", false);

		expect(result.config_root).toBe("https://remote.example/gradio");
		expect(result.script_src).toBe(
			"https://remote.example/gradio/static/js/iframeResizer.contentWindow.min.js"
		);
	});
});
