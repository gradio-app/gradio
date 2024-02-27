<script context="module" lang="ts">
	export { default as BaseButton } from "./shared/DownloadButton.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";

	import DownloadButton from "./shared/DownloadButton.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | null;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let interactive: boolean;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let icon: string | null = null;
	export let link: string | null = null;
	export let min_width: number | undefined = undefined;
	export let label: string | null = null;
	export let gradio: Gradio<{
		click: never;
	}>;
</script>

<DownloadButton
	{value}
	{label}
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{link}
	{icon}
	{min_width}
	{visible}
	disabled={!interactive}
	on:click={() => gradio.dispatch("click")}
>
	{value ? gradio.i18n(value) : ""}
</DownloadButton>
