<script lang="ts">
	import { Table } from "@gradio/table";
	export let headers: Array<string> = [];
	export let value: Array<Array<string | number>> = [["", "", ""]];
	export let is_static: boolean;

	if ($$props.default) value = $$props.default;
</script>

<Table bind:values={value} {headers} on:change editable={!is_static} />
