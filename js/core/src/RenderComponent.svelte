<svelte:options immutable={true} />

<script lang="ts">
	import type { ComponentMeta, ThemeMode } from "./types";
	import { type SvelteComponent, type ComponentType, onMount } from "svelte";
	import { translate_if_needed } from "./i18n";
	// @ts-ignore
	// import { bind, binding_callbacks } from "svelte/internal";

	export let root: string;
	export let component: ComponentMeta["component"];
	export let target: HTMLElement;
	export let theme_mode: ThemeMode;
	export let instance: ComponentMeta["instance"];
	export let value: any;
	// export let gradio: Gradio;
	export let elem_id: string;
	export let elem_classes: string[];
	export let _id: number;
	export let visible: boolean | "hidden";

	const s = (id: number, p: string, v: any): CustomEvent =>
		new CustomEvent("prop_change", { detail: { id, prop: p, value: v } });

	// function wrap(state: any) {
	// 	console.log("WRAP");
	// 	const keys = Object.keys(state);
	// 	let new_state = {};
	// 	for (const key of keys) {
	// 		console.log("key", key, state[key]);
	// 		new_state[key] = new Proxy(state[key], {
	// 			set(target, prop, value, receiver) {
	// 				console.log("set", target, prop, value, receiver);
	// 				return true;
	// 			},
	// 		});
	// 	}

	// 	return new_state;
	// }
	// console.log("$$restProps", $$restProps);
	// console.log("value", value);
	// const wrapped_props = wrap($$restProps);

	// let _component = component;

	const supported_props = [
		"description",
		"info",
		"title",
		"placeholder",
		"value",
		"label",
	];

	function translate_prop(obj: SvelteRestProps): void {
		for (const key in obj) {
			if (supported_props.includes(key as string)) {
				obj[key] = translate_if_needed(obj[key]);
			}
		}
	}

	$: translate_prop($$restProps);
	$: _value = translate_if_needed(value);

	onMount(() => {
		console.log("RENDERCOMPONENT -- mount");
	});
</script>

{#if visible}
	<svelte:component
		this={component}
		bind:this={instance}
		bind:value={_value}
		on:prop_change
		{elem_id}
		{elem_classes}
		{target}
		{visible}
		{...$$restProps}
		{theme_mode}
		{root}
	>
		<slot />
	</svelte:component>
{/if}
