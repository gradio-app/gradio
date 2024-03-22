import Prism from "prismjs";
import "prismjs/components/prism-python";
import { make_slug_processor } from "$lib/utils";

let language = "python";

const COLOR_SETS = [
	["from-green-100", "to-green-50"],
	["from-yellow-100", "to-yellow-50"],
	["from-red-100", "to-red-50"],
	["from-blue-100", "to-blue-50"],
	["from-pink-100", "to-pink-50"],
	["from-purple-100", "to-purple-50"]
];

export async function load({ parent }) {
	const {
		docs,
		components,
		helpers,
		modals,
		py_client,
		routes,
		on_main,
		wheel
	} = await parent();

	let headers = [
		["Description", "description"],
		["Example Uage", "example-usage"]
	];
	let method_headers: string[][] = [];
	const get_slug = make_slug_processor();
	let obj = {
		name: "NO_RELOAD",
		description:
			"Any code in a `if gr.NO_RELOAD` code-block will not be re-evaluated when the source file is reloaded. This is helpful for importing modules that do not like to be reloaded (tiktoken, numpy) as well as database connections and long running set up code.",
		example: `import gradio as gr

if gr.NO_RELOAD:
	from transformers import pipeline
	pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")

gr.Interface.from_pipeline(pipe).launch()
	`,
		override_signature: "if gr.NO_RELOAD:"
	};

	if (obj.name) {
		obj.slug = get_slug(obj.name);
	}
	if (obj.example) {
		obj.highlighted_example = Prism.highlight(
			obj.example,
			Prism.languages[language],
			"python"
		);
	}

	return {
		obj,
		components,
		helpers,
		modals,
		routes,
		py_client,
		COLOR_SETS,
		headers,
		method_headers,
		on_main,
		wheel
	};
}
