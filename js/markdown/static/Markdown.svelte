<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick } from "svelte";
	import { marked } from "marked";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import "katex/dist/katex.min.css";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let min_height = false;
	export let rtl = false;

	let div: HTMLDivElement;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	let mounted = false;

	$: mounted &&
		latex_delimiters.length > 0 &&
		render_math_in_element(div, {
			delimiters: latex_delimiters,
			throwOnError: false
		});

	afterUpdate(() => {
		tick().then(() => {
			requestAnimationFrame(() => {
				div.innerHTML = DOMPurify.sanitize(marked.parse(value));
				mounted = true;
			});
		});
	});
</script>

<div
	id={elem_id}
	class:min={min_height}
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	data-testid="markdown"
	dir={rtl ? "rtl" : "ltr"}
	bind:this={div}
></div>

<style>
	div :global(.math.inline) {
		fill: var(--body-text-color);
		display: inline-block;
		vertical-align: middle;
		padding: var(--size-1-5) -var(--size-1);
		color: var(--body-text-color);
	}

	div :global(.math.inline svg) {
		display: inline;
		margin-bottom: 0.22em;
	}

	div {
		max-width: 100%;
	}

	.min {
		min-height: var(--size-24);
	}
	.hide {
		display: none;
	}
</style>
