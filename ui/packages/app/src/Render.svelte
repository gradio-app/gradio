<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";

	export let root: string;
	export let component;
	export let instance_map;
	export let id: number;
	export let props;
	export let children;
	export let theme;
	export let dynamic_ids: Set<number>;
	export let has_modes: boolean;
	export let status_tracker_values: Record<number, string>;

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

	let style = props.css
		? Object.entries(props.css)
				.map((rule) => rule[0] + ": " + rule[1])
				.join("; ")
		: null;

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

	children =
		children &&
		children.filter((v) => instance_map[v.id].type !== "statustracker");
</script>

<svelte:component
	this={component}
	bind:this={instance_map[id].instance}
	bind:value={instance_map[id].value}
	{style}
	{...props}
	{root}
	tracked_status={status_tracker_values[id]}
>
	{#if children && children.length}
		{#each children as { component, id, props, children, has_modes } (id)}
			<svelte:self
				{component}
				{id}
				{props}
				{theme}
				{root}
				{instance_map}
				{children}
				{dynamic_ids}
				{has_modes}
				{status_tracker_values}
				on:destroy
				on:mount
			/>
		{/each}
	{/if}
</svelte:component>
