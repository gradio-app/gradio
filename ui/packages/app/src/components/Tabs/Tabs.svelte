<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Tabs } from "@gradio/tabs";

	const dispatch = createEventDispatcher();

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let selected: number | string;

	$: dispatch("prop_change", { selected });
</script>

<Tabs {elem_id} {visible} bind:selected on:change>
	<slot />
</Tabs>
