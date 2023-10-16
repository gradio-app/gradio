<script lang="ts">
	import { Gradio } from "./gradio_helper";
	import { onMount, createEventDispatcher, setContext } from "svelte";
	import type { ComponentMeta, ThemeMode } from "./types";

	export let root: string;
	export let component: ComponentMeta["component"];
	export let instance_map: Record<number, ComponentMeta>;

	export let id: number;
	export let props: ComponentMeta["props"];

	export let children: ComponentMeta["children"];
	export let dynamic_ids: Set<number>;
	export let parent: string | null = null;
	export let target: HTMLElement;
	export let theme_mode: ThemeMode;
	export let version: string;
	export let autoscroll: boolean;

	const dispatch = createEventDispatcher<{ mount: number; destroy: number }>();
	let filtered_children: ComponentMeta[] = [];

	onMount(() => {
		dispatch("mount", id);

		for (const child of filtered_children) {
			dispatch("mount", child.id);
		}

		return () => {
			dispatch("destroy", id);

			for (const child of filtered_children) {
				dispatch("mount", child.id);
			}
		};
	});

	$: children =
		children &&
		children.filter((v) => {
			const valid_node = instance_map[v.id].type !== "statustracker";
			if (!valid_node) {
				filtered_children.push(v);
			}
			return valid_node;
		});

	setContext("BLOCK_KEY", parent);

	function handle_prop_change(e: { detail: Record<string, any> }): void {
		for (const k in e.detail) {
			instance_map[id].props[k] = e.detail[k];
		}
	}

	$: {
		if (instance_map[id].type === "form") {
			if (children?.every((c) => !c.props.visible)) {
				props.visible = false;
			} else {
				props.visible = true;
			}
		}
	}
</script>

<svelte:component
	this={component}
	bind:this={instance_map[id].instance}
	bind:value={instance_map[id].props.value}
	elem_id={("elem_id" in props && props.elem_id) || `component-${id}`}
	elem_classes={("elem_classes" in props && props.elem_classes) || []}
	on:prop_change={handle_prop_change}
	{target}
	{...props}
	{theme_mode}
	{root}
	gradio={new Gradio(id, target, theme_mode, version, root, autoscroll)}
>
	{#if children && children.length}
		{#each children as { component, id: each_id, props, children: _children, has_modes } (each_id)}
			<svelte:self
				{component}
				{target}
				id={each_id}
				{props}
				{root}
				{instance_map}
				children={_children}
				{dynamic_ids}
				{has_modes}
				{theme_mode}
				on:destroy
				on:mount
			/>
		{/each}
	{/if}
</svelte:component>
