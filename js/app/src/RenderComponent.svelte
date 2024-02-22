<svelte:options immutable={true} />

<script lang="ts">
	import type { Gradio } from "./gradio_helper";
	import type { ComponentMeta, ThemeMode } from "./types";

	export let root: string;
	export let component: ComponentMeta["component"];
	export let target: HTMLElement;
	export let theme_mode: ThemeMode;
	export let instance: ComponentMeta["instance"];
	export let value: any;
	export let gradio: Gradio;
	export let elem_id: string;
	export let elem_classes: string[];
</script>

<svelte:component
	this={component}
	bind:this={instance}
	bind:value
	on:prop_change
	{elem_id}
	{elem_classes}
	{target}
	{...$$restProps}
	{theme_mode}
	{root}
	{gradio}
>
	<slot />
</svelte:component>
