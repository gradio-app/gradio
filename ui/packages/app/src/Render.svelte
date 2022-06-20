<script lang="ts">
	import { onMount, createEventDispatcher, setContext } from "svelte";

	export let root: string;
	export let component;
	export let instance_map;
	export let id: number;
	export let props: {
		style: Record<string, unknown>;
		visible: boolean;
		[key: string]: unknown;
	};
	interface LayoutNode {
		id: number;
		children: Array<LayoutNode>;
	}
	export let children: Array<LayoutNode>;
	export let dynamic_ids: Set<number>;
	export let has_modes: boolean | undefined;
	export let status_tracker_values: Record<number, string>;
	export let parent: string | null = null;

	const dispatch = createEventDispatcher<{ mount: number; destroy: number }>();

	if (has_modes) {
		if (props.interactive === false) {
			props.mode = "static";
		} else if (props.interactive === true) {
			props.mode = "dynamic";
		} else if (dynamic_ids.has(id)) {
			props.mode = "dynamic";
		} else {
			props.mode = "static";
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

	function get_types(i) {
		const current =
			children[i]?.id != undefined && instance_map[children[i].id];
		const next =
			children[i + 1]?.id != undefined && instance_map[children[i + 1].id];
		const prev =
			children[i - 1]?.id != undefined && instance_map[children[i - 1].id];

		return {
			current: current?.type && forms.includes(current.type),
			next: next?.type && forms.includes(next.type),
			prev: prev?.type && forms.includes(prev.type)
		};
	}

	if (children) {
		children.forEach((c, i) => {
			get_form_context(c, i);
		});
	}

	function get_form_context(node, i) {
		const { current, next, prev } = get_types(i);

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
</script>

<div class:apply-hidden={props.visible === false}>
	<svelte:component
		this={component}
		bind:this={instance_map[id].instance}
		bind:value={instance_map[id].props.value}
		elem_id={props.elem_id || id}
		{...props}
		{root}
	>
		{#if children && children.length}
			{#each children as { component, id: each_id, props, children, has_modes } (each_id)}
				<svelte:self
					parent={instance_map[id].type}
					{component}
					id={each_id}
					{props}
					{root}
					{instance_map}
					{children}
					{dynamic_ids}
					{has_modes}
					on:destroy
					on:mount
				/>
			{/each}
		{/if}
	</svelte:component>
</div>
