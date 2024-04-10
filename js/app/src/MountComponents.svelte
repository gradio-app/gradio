<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import Render from "./Render.svelte";

	export let rootNode: any;
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

<Render node={rootNode} {root} {target} {theme_mode} {version} {autoscroll} />
