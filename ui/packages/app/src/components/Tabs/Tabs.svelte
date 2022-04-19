<script lang="ts">
	import { Tabs } from "@gradio/tabs";

	export let style: string = "";
</script>

<Tabs on:change {style}>
	<slot />
</Tabs>
