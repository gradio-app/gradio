<script lang="ts">
	import { create_classes, get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	import { getContext } from "svelte";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let color: "grey" | "green" = "grey";
	export let padding: boolean = true;
	export let form_position: "first" | "last" | "mid" | "single" | undefined =
		undefined;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let disable: boolean = false;
	export let explicit_call: boolean = false;

	const styles = {
		dashed: "border-dashed border border-gray-300",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400",
		none: "!border-0"
	};

	const form_styles = {
		column: {
			first: "rounded-t-lg",
			last: "rounded-b-lg",
			mid: "",
			single: "rounded-lg"
		},
		row: {
			first: "rounded-t-lg md:rounded-t-none md:rounded-l-lg ",
			last: "rounded-b-lg md:rounded-b-none md:rounded-r-lg",
			mid: "",
			single: "rounded-lg"
		}
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>("BLOCK_KEY");

	$: _parent = parent === "column" || parent == "row" ? parent : "column";

	$: form_class = form_position
		? form_styles?.[(_parent as "column" | "row") || "column"][form_position]
		: "";

	const { classes } = explicit_call
		? get_styles(style, ["rounded", "border"])
		: disable
		? get_styles({ container: false }, ["container"])
		: { classes: "" };

	$: rounded =
		typeof style.rounded !== "boolean" ||
		(typeof style.rounded === "boolean" && style.rounded);

	$: rounded_style = get_styles({ rounded: rounded }, ["rounded"]).classes;
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class="w-full overflow-hidden {styles[variant]} {rounded
		? styles[color]
		: ''} {form_class} {classes} {rounded_style}"
	class:gr-panel={padding}
	class:form={form_position}
	class:gr-box-unrounded={!rounded && form_position}
	class:gr-box={!form_position}
>
	<slot />
</svelte:element>
