<script lang="ts">
	import { onMount, tick } from "svelte";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import { marked } from "./utils";

	export let message: string;

	let el: HTMLSpanElement;
	let mounted = false;

	onMount(() => {
		tick().then((v) => {
			requestAnimationFrame(() => {
				el.innerHTML = DOMPurify.sanitize(marked.parse(message));
				mounted = true;
			});
		});
	});

	$: mounted &&
		render_math_in_element(el, {
			delimiters: [
				{ left: "$$", right: "$$", display: true },
				{ left: "$", right: "$", display: false }
			],
			throwOnError: false
		});
</script>

<span bind:this={el} />
