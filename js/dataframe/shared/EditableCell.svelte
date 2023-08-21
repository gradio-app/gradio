<script lang="ts">
	import { afterUpdate, tick } from "svelte";
	import { marked } from "marked";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import "katex/dist/katex.min.css";

	export let edit: boolean;
	export let value: string | number = "";
	export let el: HTMLInputElement | null;
	export let header = false;
	export let datatype:
		| "str"
		| "markdown"
		| "html"
		| "number"
		| "bool"
		| "date" = "str";
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	let span: HTMLSpanElement;
	let mounted = false;

	$: mounted &&
		latex_delimiters.length > 0 &&
		render_math_in_element(span, {
			delimiters: latex_delimiters,
			throwOnError: false
		});

	afterUpdate(() => {
		if (datatype == "markdown") {
			tick().then(() => {
				requestAnimationFrame(() => {
					span.innerHTML = DOMPurify.sanitize(marked.parse(value.toString()));
					mounted = true;
				});
			});
		}
	});
</script>

{#if edit}
	<input
		class:header
		tabindex="-1"
		{value}
		bind:this={el}
		on:keydown
		on:blur={({ currentTarget }) => {
			value = currentTarget.value;
			currentTarget.setAttribute("tabindex", "-1");
		}}
	/>
{/if}
<span on:dblclick tabindex="-1" role="button" class:edit bind:this={span}>
	{#if datatype === "html"}
		{@html value}
	{:else}
		{value}
	{/if}
</span>

<style>
	input {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		bottom: var(--size-2);
		left: var(--size-2);
		flex: 1 1 0%;
		transform: translateX(-0.1px);
		outline: none;
		border: none;
		background: transparent;
	}

	span {
		flex: 1 1 0%;
		outline: none;
		padding: var(--size-2);
	}

	.header {
		transform: translateX(0);
		font: var(--weight-bold);
	}

	.edit {
		opacity: 0;
		pointer-events: none;
	}
</style>
