<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	import { getContext } from "svelte";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let color: "grey" | "green" = "grey";
	export let padding: boolean = true;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let disable: boolean = false;
	export let explicit_call: boolean = false;
	export let visible = true;

	const styles = {
		dashed: "border-dashed border border-gray-300",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400",
		none: "!border-0"
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>("BLOCK_KEY");

	$: _parent = parent === "column" || parent == "row" ? parent : "column";

	$: ({ classes } = explicit_call
		? get_styles(style, ["rounded", "border"])
		: disable
		? get_styles({ container: false }, ["container"])
		: { classes: "" });

	$: rounded =
		typeof style.rounded !== "boolean" ||
		(typeof style.rounded === "boolean" && style.rounded);

	$: rounded_style =
		typeof style.rounded === "boolean"
			? get_styles({ rounded: rounded }, ["rounded"]).classes
			: "";
	$: size_style =
		"" +
		(typeof style.width === "number" ? `height: ${style.width}px; ` : "") +
		(typeof style.width === "number" ? `width: ${style.width}px;` : "");
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class:!hidden={visible === false}
	class="gr-block relative w-full overflow-hidden {styles[variant]} {rounded
		? styles[color]
		: ''} {classes} {rounded_style}"
	class:gr-panel={padding}
	class:gr-box-unrounded={!rounded}
	style={size_style || null}
>
	<slot />
</svelte:element>
