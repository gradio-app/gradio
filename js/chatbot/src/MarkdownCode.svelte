<script lang="ts">
	import { afterUpdate, tick } from "svelte";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import { marked } from "./utils";

	export let message: string;
	export let latex_delimiters: Array<{
		left: string;
		right: string;
		display: boolean;
	}>;

	let el: HTMLSpanElement;
	let mounted = false;

	afterUpdate(() => {
		tick().then(() => {
			requestAnimationFrame(() => {
				el.innerHTML = DOMPurify.sanitize(marked.parse(message));
				mounted = true;
			});
		});
	});

	$: mounted &&
		latex_delimiters.length > 0 &&
		render_math_in_element(el, {
			delimiters: latex_delimiters,
			throwOnError: false
		});
</script>

<span bind:this={el} />

<style>
	span :global(code[class*="language-"]),
	span :global(pre[class*="language-"]) {
		font-size: var(--text-md);
	}
</style>
