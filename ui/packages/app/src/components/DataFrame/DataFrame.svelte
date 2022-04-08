<script lang="ts">
	import { Table } from "@gradio/table";
	export let headers: Array<string> = [];
	export let value: Array<Array<string | number>> = [["", "", ""]];
	export let default_value: Array<Array<string | number>> = [["", "", ""]];

	export let style: string = "";
	export let is_static: boolean;

	if (default_value) value = default_value;
</script>

<Table bind:values={value} {headers} {style} on:change editable={!is_static} />
