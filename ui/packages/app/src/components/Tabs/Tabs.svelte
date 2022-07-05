<script lang="ts">
	import { Tabs } from "@gradio/tabs";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let selected: number | string;
</script>

<Tabs {elem_id} {visible} bind:selected on:change>
	<slot />
</Tabs>
