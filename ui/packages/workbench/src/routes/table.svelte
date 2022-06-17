<script lang="ts">
	import { Table } from "@gradio/table";

	const src = [
		[1, "Two", "Three"],
		[2, "Four", "Five"],
		[3, "Six", "Seven"]
	];

	let values = [[1, "Two", "Three"]];

	const src_two = [
		[
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing."
		],
		[
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing."
		],
		[
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing.",
			"Hello my name is frank, I am liking the small turtle you have there. It would be a shame if it went missing."
		]
	];
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

<Table
	wrap={true}
	values={src_two}
	headers={["Num", "Two", "Three"]}
	col_count={[3, "dynamic"]}
	editable
	row_count={[3, "dynamic"]}
	label={"Data"}
/>
