<script context="module" lang="ts">
	export { default as BaseButton } from "./shared/DownloadButton.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { type FileData } from "@gradio/client";

	import DownloadButton from "./shared/DownloadButton.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let interactive: boolean;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let icon: null | FileData = null;
	export let min_width: number | undefined = undefined;
	export let label: string | null = null;
	export let gradio: Gradio<{
		click: never;
	}>;
</script>

<DownloadButton
	{value}
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{icon}
	{min_width}
	{visible}
	disabled={!interactive}
	on:click={() => gradio.dispatch("click")}
>
	{label ?? ""}
</DownloadButton>
