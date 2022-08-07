<script lang="ts">
	import { onMount, createEventDispatcher, setContext } from "svelte";
	import type { ComponentMeta } from "./components/types";

	export let root: string;
	export let component: ComponentMeta["component"];
	export let instance_map: Record<number, ComponentMeta>;

	export let id: number;
	export let props: ComponentMeta["props"];

	export let children: ComponentMeta["children"];
	export let dynamic_ids: Set<number>;
	export let has_modes: boolean | undefined;
	export let parent: string | null = null;

	const dispatch = createEventDispatcher<{ mount: number; destroy: number }>();

	if (has_modes) {
		if ((props as any).interactive === false) {
			(props as any).mode = "static";
		} else if ((props as any).interactive === true) {
			(props as any).mode = "dynamic";
		} else if (dynamic_ids.has(id)) {
			(props as any).mode = "dynamic";
		} else {
			(props as any).mode = "static";
		}
	}

	onMount(() => {
		dispatch("mount", id);

		return () => dispatch("destroy", id);
	});

	const forms = [
		"textbox",
		"number",
		"slider",
		"checkbox",
		"checkboxgroup",
		"radio",
		"dropdown"
	];

	function get_types(i: number) {
		if (!children) return;

		const current =
			children[i]?.id != undefined && instance_map[children[i].id];
		const next =
			children[i + 1]?.id != undefined && instance_map[children[i + 1].id];
		const prev =
			children[i - 1]?.id != undefined && instance_map[children[i - 1].id];

		return {
			current: current && current?.type && forms.includes(current.type),
			next: next && next?.type && forms.includes(next.type),
			prev: prev && prev?.type && forms.includes(prev.type)
		};
	}

	if (children) {
		children.forEach((c, i) => {
			get_form_context(c, i);
		});
	}

	function get_form_context(node: ComponentMeta, i: number) {
		const { current, next, prev } = get_types(i) || {};

		if (current && next && prev) {
			node.props.form_position = "mid";
		} else if (current && next && !prev) {
			node.props.form_position = "first";
		} else if (current && prev && !next) {
			node.props.form_position = "last";
		} else if (current && !prev && !next) {
			node.props.form_position = "single";
		}
	}

	$: children =
		children &&
		children.filter((v) => instance_map[v.id].type !== "statustracker");

	setContext("BLOCK_KEY", parent);

	function handle_prop_change(e: { detail: Record<string, any> }) {
		for (const k in e.detail) {
			instance_map[id].props[k] = e.detail[k];
		}
	}
</script>

<svelte:component
	this={component}
	bind:this={instance_map[id].instance}
	bind:value={instance_map[id].props.value}
	elem_id={("elem_id" in props && props.elem_id) || `${id}`}
	on:prop_change={handle_prop_change}
	{...props}
	{root}
>
	{#if children && children.length}
		{#each children as { component, id: each_id, props, children: _children, has_modes } (each_id)}
			<svelte:self
				parent={instance_map[id].type}
				{component}
				id={each_id}
				{props}
				{root}
				{instance_map}
				children={_children}
				{dynamic_ids}
				{has_modes}
				on:destroy
				on:mount
			/>
		{/each}
	{/if}
</svelte:component>
