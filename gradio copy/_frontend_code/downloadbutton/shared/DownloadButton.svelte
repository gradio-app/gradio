<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { type FileData } from "@gradio/client";
	import { BaseButton } from "@gradio/button";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let size: "sm" | "lg" = "lg";
	export let value: null | FileData;
	export let icon: null | FileData;
	export let disabled = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	const dispatch = createEventDispatcher();

	function download_file(): void {
		dispatch("click");
		if (!value?.url) {
			return;
		}
		let file_name;
		if (!value.orig_name && value.url) {
			const parts = value.url.split("/");
			file_name = parts[parts.length - 1];
			file_name = file_name.split("?")[0].split("#")[0];
		} else {
			file_name = value.orig_name;
		}
		const a = document.createElement("a");
		a.href = value.url;
		a.download = file_name || "file";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<BaseButton
	{size}
	{variant}
	{elem_id}
	{elem_classes}
	{visible}
	on:click={download_file}
	{scale}
	{min_width}
	{disabled}
>
	{#if icon}
		<img class="button-icon" src={icon.url} alt={`${value} icon`} />
	{/if}
	<slot />
</BaseButton>

<style>
	.button-icon {
		width: var(--text-xl);
		height: var(--text-xl);
		margin-right: var(--spacing-xl);
	}
</style>
