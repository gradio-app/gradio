<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	import { getContext } from "svelte";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let border_mode: "base" | "focus" = "base";
	export let padding: boolean = true;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let disable: boolean = false;
	export let explicit_call: boolean = false;
	export let visible = true;
	export let allow_overflow = true;

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
	class="block {elem_classes.join(' ')}"
	class:padded={padding}
	class:border_focus={border_mode === "focus"}
	style="{styles} {size_style || null}"
	style:border-style={variant}
	style:overflow={allow_overflow ? "visible" : "hidden"}
>
	<slot />
</svelte:element>

<style>
	.block {
		position: relative;
		margin: 0;
		box-shadow: var(--block-shadow);
		border-width: var(--block-border-width);
		border-color: var(--block-border-color);
		border-radius: var(--block-radius);
		background: var(--block-background-fill);
		width: 100%;
		line-height: var(--line-sm);
	}

	.block.border_focus {
		border-color: var(--color-accent);
	}

	.padded {
		padding: var(--block-padding);
	}

	.hidden {
		display: none;
	}
</style>
