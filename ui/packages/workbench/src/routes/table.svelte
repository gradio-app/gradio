<script lang="ts">
	import { Table } from "@gradio/table";

	const src = [
		[1, "Two", "Three"],
		[2, "Four", "Five"],
		[3, "Six", "Seven"]
	];

	let values = [[1, "Two", "Three"]];
</script>

<Table
	{values}
	headers={["Num", "Two", "Three"]}
	col_count={[3, "dynamic"]}
	editable
	row_count={[3, "dynamic"]}
	label={"Data"}
/>
<button class="gr-button" on:click={() => (values = src)}>Populate</button>
