<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { Download, Check } from "@gradio/icons";
	import { DownloadLink } from "@gradio/wasm/svelte";

	export let value: string;
	export let language: string;

	$: ext = get_ext_for_type(language);

	function get_ext_for_type(type: string): string {
		const exts: Record<string, string> = {
			py: "py",
			python: "py",
			md: "md",
			markdown: "md",
			json: "json",
			html: "html",
			css: "css",
			js: "js",
			javascript: "js",
			ts: "ts",
			typescript: "ts",
			yaml: "yaml",
			yml: "yml",
			dockerfile: "dockerfile",
			sh: "sh",
			shell: "sh",
			r: "r"
		};

		return exts[type] || "txt";
	}

	let copied = false;
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	$: download_value = URL.createObjectURL(new Blob([value]));

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<div class="container">
	<DownloadLink
		download="file.{ext}"
		href={download_value}
		on:click={copy_feedback}
	>
		<Download />
		{#if copied}
			<span class="check" transition:fade><Check /></span>
		{/if}
	</DownloadLink>
</div>

<style>
	.container {
		position: relative;
		cursor: pointer;
		padding: 5px;

		width: 22px;
		height: 22px;
	}

	.check {
		position: absolute;
		top: 0;
		right: 0;
		z-index: var(--layer-top);
		background: var(--background-fill-primary);
		padding: var(--size-1);
		width: 100%;
		height: 100%;
		color: var(--body-text-color);
	}
</style>
