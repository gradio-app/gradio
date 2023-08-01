<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Tabs from "./static";

	const dispatch = createEventDispatcher();

	export let visible = true;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let selected: number | string;

	$: dispatch("prop_change", { selected });
</script>

<Tabs {visible} {elem_id} {elem_classes} bind:selected on:change on:select>
	<slot />
</Tabs>
