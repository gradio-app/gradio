<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";
	import { type FileData, normalise_file } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let mode: "static" | "dynamic" = "dynamic";
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let icon: FileData | null = null;
	export let link: string | null = null;
	export let root: string;
	export let root_url: null | string;
	export let min_width: number | undefined = undefined;

	let _icon: FileData | null = null;

	$: {
		if (icon) {
			_icon = normalise_file(icon, root, root_url) as FileData;
		} else {
			_icon = null;
		}
	}
</script>

<Button
	{value}
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{link}
	{_icon}
	{min_width}
	{visible}
	disabled={mode === "static"}
	on:click
>
	{$_(value)}
</Button>
