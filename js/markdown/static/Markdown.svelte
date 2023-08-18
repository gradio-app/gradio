<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick } from "svelte";
	import { marked, type Renderer } from "marked";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import DOMPurify from "dompurify";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let min_height = false;
	export let rtl = false;

	let div: HTMLDivElement;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	let old_message = "";
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[] = [{left: '$', right: '$', display: false}];

	let mounted = false;
	
	$: mounted &&
		latex_delimiters.length > 0 &&
		render_math_in_element(div, {
			delimiters: latex_delimiters,
			throwOnError: false
		});

	afterUpdate(() => {
		tick().then(() => {
			if (value !== old_message) {
				requestAnimationFrame(() => {
					div.innerHTML = DOMPurify.sanitize(marked.parse(value));
					mounted = true;
					old_message = value;
				});
			}
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
>
	{@html DOMPurify.sanitize(marked.parse(value))}
</div>

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
