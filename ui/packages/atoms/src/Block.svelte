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
	export let allow_overflow = true;

	const color_style = {
		grey: "var(--color-border-primary)",
		green: "var(--color-functional-success)"
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>("BLOCK_KEY");

	$: _parent = parent === "column" || parent == "row" ? parent : "column";

	$: ({ styles } = explicit_call
		? get_styles(style, [])
		: disable
		? get_styles({ container: false }, ["container"])
		: { styles: "" });
	$: size_style =
		"" +
		(typeof style.height === "number" ? `height: ${style.height}px; ` : "") +
		(typeof style.width === "number" ? `width: ${style.width}px;` : "");
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class:hidden={visible === false}
	class="block"
	class:padded={padding}
	style="{styles} {size_style || null}"
	style:border-style={variant}
	style:border-color={color_style[color]}
	style:overflow={allow_overflow ? "" : "hidden"}
>
	<slot />
</svelte:element>

<style>
	.block {
		position: relative;
		margin: 0;
		box-shadow: var(--shadow-drop);
		border-width: 1px;
		border-radius: var(--radius-lg);
		background: var(--color-background-tertiary);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	.padded {
		padding: var(--size-2-5) var(--size-3);
	}

	.hidden {
		display: none;
	}
</style>
