<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import Render from "./Render.svelte";

	export let rootNode: any;
	export let dynamic_ids: any;
	export let instance_map: any;
	export let root: any;
	export let target: any;
	export let theme_mode: any;
	export let version: any;
	export let autoscroll: boolean;

	const dispatch = createEventDispatcher<{ mount?: never }>();
	onMount(() => {
		dispatch("mount");
	});
</script>

<Render
	component={rootNode.component}
	id={rootNode.id}
	props={rootNode.props}
	children={rootNode.children}
	{dynamic_ids}
	{instance_map}
	{root}
	{target}
	{theme_mode}
	{version}
	{autoscroll}
/>
