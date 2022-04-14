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

	const dispatch = createEventDispatcher<{ mount: number; destroy: number }>();

	if (has_modes) {
		if (props.interactive === false) {
			props.mode = "static";
		} else if (props.interactive === true) {
			props.mode = "dynamic";
		} else if (props.interactive === null && dynamic_ids.has(id)) {
			props.mode = "dynamic";
		} else {
			props.mode = "static";
		}
	}

	onMount(() => {
		dispatch("mount", id);

		return () => dispatch("destroy", id);
	});

	let style =
		"css" in props
			? Object.entries(props.css)
					.map((rule) => rule[0] + ": " + rule[1])
					.join("; ")
			: null;
</script>

<svelte:component
	this={component}
	bind:this={instance_map[id].instance}
	bind:value={instance_map[id].value}
	{style}
	{...props}
	{root}
>
	{#if children && children.length}
		{#each children as { component, id, props, children, has_modes }}
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
				on:destroy
				on:mount
			/>
		{/each}
	{/if}
</svelte:component>
