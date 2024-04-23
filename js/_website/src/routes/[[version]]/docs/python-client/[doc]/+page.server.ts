import Prism from "prismjs";
import "prismjs/components/prism-python";
import { make_slug_processor } from "$lib/utils";
import { error } from "@sveltejs/kit";
import { style_formatted_text } from "$lib/text";

let language = "python";

const COLOR_SETS = [
	["from-green-100", "to-green-50"],
	["from-yellow-100", "to-yellow-50"],
	["from-red-100", "to-red-50"],
	["from-blue-100", "to-blue-50"],
	["from-pink-100", "to-pink-50"],
	["from-purple-100", "to-purple-50"]
];

export async function load({ params, parent }) {
	const {
		docs,
		components,
		helpers,
		modals,
		py_client,
		routes,
		on_main,
		wheel,
		pages,
		url_version
	} = await parent();

	let name = params.doc;
	let obj;
	let mode;
	let headers = [];
	let method_headers = [];
	const get_slug = make_slug_processor();

	let py_client_pages = ["intro", "client", "job"];

	if (!py_client_pages.some((p: string) => p === params.doc)) {
		throw error(404);
	}

	for (const key in py_client) {
		if (py_client[key].name) {
			py_client[key].slug = get_slug(py_client[key].name);
		}

		if (py_client[key].fns && py_client[key].fns.length) {
			py_client[key].fns.forEach((fn: any) => {
				if (fn.name) fn.slug = get_slug(`${py_client[key].name} ${fn.name}`);
			});
		}
		if (key == name) {
			obj = py_client[key];
			mode = key;

			if (obj.name == "Interface") {
				obj.next_obj = "ChatInterface";
			} else if (obj.name == "ChatInterface") {
				obj.prev_obj = "Interface";
				obj.next_obj = "TabbedInterface";
			} else if (obj.name == "TabbedInterface") {
				obj.prev_obj = "ChatInterface";
				obj.next_obj = "Blocks";
			} else if (obj.name == "Blocks") {
				obj.prev_obj = "TabbedInterface";
				obj.next_obj = "Row";
			}

			if ("description" in obj) {
				headers.push(["Description", "description"]);
				obj.description = style_formatted_text(obj.description);
			}

			if ("demos" in obj) {
				obj.demos.forEach((demo: string[]) => {
					demo.push(
						Prism.highlight(demo[1], Prism.languages[language], "python")
					);
				});
			}

			if (obj.example) {
				obj.highlighted_example = Prism.highlight(
					obj.example,
					Prism.languages[language],
					"python"
				);
				headers.push(["Example Usage", "example-usage"]);
			}
			if (mode === "components") {
				headers.push(["Behavior", "behavior"]);
			}
			if (
				(obj.parameters.length > 0 && obj.parameters[0].name != "self") ||
				obj.parameters.length > 1
			) {
				headers.push(["Initialization", "initialization"]);
			}
			if (mode === "components" && obj.string_shortcuts) {
				headers.push(["Shortcuts", "shortcuts"]);
			}

			if ("demos" in obj) {
				headers.push(["Demos", "demos"]);
			}

			if ("fns" in obj && obj.fns.length > 0) {
				if (mode === "components") {
					headers.push(["Event Listeners", "event-listeners"]);
				} else {
					headers.push(["Methods", "methods"]);
					for (const fn of obj.fns) {
						method_headers.push([fn.name, fn.slug]);
						if (fn.example) {
							fn.highlighted_example = Prism.highlight(
								fn.example,
								Prism.languages[language],
								"python"
							);
						}
					}
				}
				for (const fn of obj.fns) {
					if ("description" in fn) {
						fn.description = style_formatted_text(fn.description);
					}
					if (fn.parameters.length > 0) {
						for (const param of fn.parameters) {
							if (param.doc) {
								param.doc = style_formatted_text(param.doc);
							}
						}
					}
				}
			}
			if ("tags" in obj) {
				if ("preprocessing" in obj.tags) {
					obj.tags.preprocessing = style_formatted_text(obj.tags.preprocessing);
				}
				if ("postprocessing" in obj.tags) {
					obj.tags.postprocessing = style_formatted_text(
						obj.tags.postprocessing
					);
				}
				if ("examples_format" in obj.tags) {
					obj.tags.examples_format = style_formatted_text(
						obj.tags.examples_format
					);
				}
				if ("events" in obj.tags) {
					obj.tags.events = style_formatted_text(obj.tags.events);
				}
			}
			if (obj.parameters.length > 0) {
				for (const param of obj.parameters) {
					if (param.doc) {
						param.doc = style_formatted_text(param.doc);
					}
				}
			}
		}
	}

	return {
		name,
		obj,
		mode,
		components,
		helpers,
		modals,
		routes,
		py_client,
		py_client_pages,
		COLOR_SETS,
		headers,
		method_headers,
		on_main,
		wheel,
		url_version
	};
}
