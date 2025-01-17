<script lang="ts">
	import Column from "@gradio/column";
	import { onMount } from "svelte";
	export let route: string;
	let visible = false;

	onMount(() => {
		visible = window.location.pathname.endsWith(`/page-${route}`) || (window.location.pathname == "/" && route == "");
	});
</script>

<Column {visible}>
	<slot></slot>
</Column>
