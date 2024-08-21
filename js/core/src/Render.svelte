<script lang="ts">
	import { Gradio, formatter } from "./gradio_helper";
	import { onMount, createEventDispatcher, setContext } from "svelte";
	import type { ComponentMeta, ThemeMode } from "./types";
	import type { Client } from "@gradio/client";
	import RenderComponent from "./RenderComponent.svelte";
	import { load_component } from "virtual:component-loader";

	export let root: string;

	export let node: ComponentMeta;
	export let parent: string | null = null;
	export let target: HTMLElement;
	export let theme_mode: ThemeMode;
	export let version: string;
	export let autoscroll: boolean;
	export let max_file_size: number | null;
	export let client: Client;

	const dispatch = createEventDispatcher<{ mount: number; destroy: number }>();
	let filtered_children: ComponentMeta[] = [];

	onMount(() => {
		dispatch("mount", node.id);

		for (const child of filtered_children) {
			dispatch("mount", child.id);
		}

		return () => {
			dispatch("destroy", node.id);

			for (const child of filtered_children) {
				dispatch("mount", child.id);
			}
		};
	});

	$: node.children =
		node.children &&
		node.children.filter((v) => {
			const valid_node = node.type !== "statustracker";
			if (!valid_node) {
				filtered_children.push(v);
			}
			return valid_node;
		});

	setContext("BLOCK_KEY", parent);

	$: {
		if (node.type === "form") {
			if (node.children?.every((c) => !c.props.visible)) {
				node.props.visible = false;
			} else {
				node.props.visible = true;
			}
		}
	}

	$: gradio_class = new Gradio<Record<string, any>>(
		node.id,
		target,
		theme_mode,
		version,
		root,
		autoscroll,
		max_file_size,
		formatter,
		client,
		load_component
	);
</script>

<RenderComponent
	_id={node.id}
	component={node.component}
	bind:instance={node.instance}
	bind:value={node.props.value}
	elem_id={("elem_id" in node.props && node.props.elem_id) ||
		`component-${node.id}`}
	elem_classes={("elem_classes" in node.props && node.props.elem_classes) || []}
	{target}
	{...node.props}
	{theme_mode}
	{root}
	gradio={gradio_class}
>
	{#if node.children && node.children.length}
		{#each node.children as _node (_node.id)}
			<svelte:self
				node={_node}
				component={_node.component}
				{target}
				id={_node.id}
				{root}
				{theme_mode}
				on:destroy
				on:mount
				{max_file_size}
				{client}
			/>
		{/each}
	{/if}
</RenderComponent>
