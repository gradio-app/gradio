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
		? get_styles(style, [])
		: disable
		? get_styles({ container: false }, ["container"])
		: { classes: "" });
	$: size_style =
		"" +
		(typeof style.height === "number" ? `height: ${style.height}px; ` : "") +
		(typeof style.width === "number" ? `width: ${style.width}px;` : "");
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class:!hidden={visible === false}
	class="gr-block gr-box relative w-full overflow-hidden {styles[
		variant
	]} {styles[color]} {classes}"
	class:gr-padded={padding}
	style={size_style || null}
>
	<slot />
</svelte:element>
