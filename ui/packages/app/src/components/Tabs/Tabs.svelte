<script lang="ts">
	import { Tabs } from "@gradio/tabs";

	export let style: Record<string, string> = {};
</script>

<Tabs on:change {style}>
	<slot />
</Tabs>
