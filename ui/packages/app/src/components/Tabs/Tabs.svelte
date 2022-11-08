<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Tabs } from "@gradio/tabs";

	const dispatch = createEventDispatcher();

	export let visible: boolean = true;
	export let elem_id: string = "";
	export let selected: number | string;

	$: dispatch("prop_change", { selected });
</script>

<Tabs {visible} {elem_id} bind:selected on:change>
	<slot />
</Tabs>
