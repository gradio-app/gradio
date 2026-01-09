<script lang="ts">
	import { type FileData } from "@gradio/client";
	import { BaseButton } from "@gradio/button";
	import { type Snippet } from "svelte";

	let {
		elem_id = "",
		elem_classes = [],
		visible = true,
		variant = "secondary",
		size = "lg",
		value,
		icon,
		disabled = false,
		scale = null,
		min_width = undefined,
		on_click,
		children
	}: {
		elem_id?: string;
		elem_classes?: string[];
		visible?: boolean | "hidden";
		variant?: "primary" | "secondary" | "stop";
		size?: "sm" | "md" | "lg";
		value: FileData | null;
		icon: FileData | null;
		disabled?: boolean;
		scale?: number | null;
		min_width?: number | undefined;
		on_click?: () => void;
		children?: Snippet;
	} = $props();

	function download_file(): void {
		on_click?.();
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
	onclick={download_file}
	{scale}
	{min_width}
	{disabled}
>
	{#if icon}
		<img class="button-icon" src={icon.url} alt={`${value} icon`} />
	{/if}
	{#if children}
		{@render children()}
	{/if}
</BaseButton>

<style>
	.button-icon {
		width: var(--text-xl);
		height: var(--text-xl);
		margin-right: var(--spacing-xl);
	}
</style>
