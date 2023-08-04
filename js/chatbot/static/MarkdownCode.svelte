<script lang="ts">
	import { afterUpdate, tick, createEventDispatcher } from "svelte";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import { marked } from "../utils";
	const dispatch = createEventDispatcher();

	export let message: string;
	let old_message = "";
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	let el: HTMLSpanElement;
	let mounted = false;

	DOMPurify.addHook("afterSanitizeAttributes", function (node) {
		if ("target" in node) {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});

	afterUpdate(() => {
		tick().then(() => {
			if (message !== old_message) {
				requestAnimationFrame(() => {
					el.innerHTML = DOMPurify.sanitize(marked.parse(message));
					mounted = true;
					old_message = message;
					dispatch("load");
				});
			}
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
