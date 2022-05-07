<script lang="ts">
	import { TabItem } from "@gradio/tabs";

	export let label: string;
</script>

<TabItem name={label} on:select>
	<slot />
</TabItem>
