<script lang="ts">
	import TabItem from "./static";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let label: string;
	export let id: string | number;
</script>

<TabItem {elem_id} {elem_classes} name={label} {id} on:select>
	<slot />
</TabItem>
