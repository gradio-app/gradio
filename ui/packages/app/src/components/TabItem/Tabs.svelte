<script lang="ts">
	import { TabItem } from "@gradio/tabs";

	export let label: string;
	export let style: string = "";
</script>

<TabItem {style} name={label} on:select>
	<slot />
</TabItem>
