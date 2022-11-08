<script lang="ts">
	import { TabItem } from "@gradio/tabs";

	export let elem_id: string = "";
	export let label: string;
	export let id: string | number;
</script>

<TabItem {elem_id} name={label} {id} on:select>
	<slot />
</TabItem>
