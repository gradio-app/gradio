<script context="module" lang="ts">
	export { default as BaseButton } from "./shared/Button.svelte";
</script>

<script lang="ts">
	import type { Gradio, ShareData } from "@gradio/utils";

	import Button from "./shared/Button.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let interactive: boolean;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let icon: string | null = null;
	export let link: string | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		click: never;
	}>;
	export let root = "";
	export let proxy_url: null | string = null;
</script>

<Button
	{value}
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{link}
	{icon}
	{min_width}
	{visible}
	{root}
	{proxy_url}
	disabled={!interactive}
	on:click={() => gradio.dispatch("click")}
>
	{gradio.i18n(value)}
</Button>
