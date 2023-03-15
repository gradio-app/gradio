<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Tabs } from "@gradio/tabs";

	const dispatch = createEventDispatcher();

	export let visible: boolean = true;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let selected: number | string;

	$: dispatch("prop_change", { selected });
</script>

<Tabs {visible} {elem_id} {elem_classes} bind:selected on:change on:select>
	<slot />
</Tabs>
