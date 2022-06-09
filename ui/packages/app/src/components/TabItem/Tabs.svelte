<script lang="ts">
	import { TabItem } from "@gradio/tabs";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let label: string;
</script>

<TabItem {elem_id} {visible} name={label} on:select>
	<slot />
</TabItem>
