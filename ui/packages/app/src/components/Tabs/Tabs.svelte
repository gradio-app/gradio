<script lang="ts">
	import { Tabs } from "@gradio/tabs";

	export let elem_id: string = "";
	export let visible: boolean = true;
</script>

<Tabs {elem_id} {visible} on:change>
	<slot />
</Tabs>
