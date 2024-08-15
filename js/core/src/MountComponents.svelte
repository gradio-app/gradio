<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import type { Client } from "@gradio/client";
	import Render from "./Render.svelte";

	export let rootNode: any;
	export let root: any;
	export let target: any;
	export let theme_mode: any;
	export let version: any;
	export let autoscroll: boolean;
	export let max_file_size: number | null = null;
	export let client: Client;

	const dispatch = createEventDispatcher<{ mount?: never }>();
	onMount(() => {
		dispatch("mount");
	});
</script>

<Render
	node={rootNode}
	{root}
	{target}
	{theme_mode}
	{version}
	{autoscroll}
	{max_file_size}
	{client}
/>
