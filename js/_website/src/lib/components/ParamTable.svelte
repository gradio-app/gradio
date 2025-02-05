<script lang="ts">
	export let parameters = [] as any[];
	export let header = "Parameters";
	export let anchor_links: string | boolean = true;

	import ParamViewer from "@gradio/paramviewer";

	interface OriginalParam {
		annotation: string | null;
		doc: string;
		default?: string | null;
		name: string;
	}

	interface NewParam {
		type: string | null;
		description: string;
		default: string | null;
		name?: string;
	}

	function decode_html_entities(text: string | null): string {
		if (text == null) {
			return "";
		}

		const entities: { [key: string]: string } = {
			"&quot;": '"',
			"&apos;": "'",
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&nbsp;": " ",
			"&iexcl;": "¡"
		};

		const decimal_regex = /&#(\d+);/g;
		const hex_regex = /&#x([0-9A-Fa-f]+);/g;
		const named_regex = new RegExp(Object.keys(entities).join("|"), "g");

		return text
			.replace(decimal_regex, (_, code) =>
				String.fromCharCode(parseInt(code, 10))
			)
			.replace(hex_regex, (_, code) => String.fromCharCode(parseInt(code, 16)))
			.replace(named_regex, (match) => entities[match]);
	}
	function convert_params(
		original_parameters: OriginalParam[]
	): Record<string, NewParam> {
		let new_parameters: Record<string, NewParam> = {};
		for (let param of original_parameters) {
			new_parameters[param.name] = {
				type: param.annotation
					.replaceAll("Sequence[", "list[")
					.replaceAll("AbstractSet[", "set[")
					.replaceAll("Mapping[", "dict["),
				description: decode_html_entities(param.doc),
				default: param.default || null
			};
		}
		return new_parameters;
	}
	let new_parameters = convert_params(parameters);
</script>

<ParamViewer
	value={new_parameters}
	{header}
	anchor_links={typeof anchor_links === "string"
		? anchor_links.toLowerCase()
		: anchor_links}
/>
