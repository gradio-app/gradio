<script lang="ts">
	import { Tabs } from "@gradio/tabs";

	export let elem_id: string = "";
</script>

<Tabs on:change >
	<slot />
</Tabs>
