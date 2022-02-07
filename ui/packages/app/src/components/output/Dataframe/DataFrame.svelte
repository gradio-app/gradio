<script lang="ts">
	import DataFrame from "../../input/DataFrame/DataFrame.svelte";

	export let headers: Array<string>;
	export let value: {
		data: (string | number)[][];
		headers: Array<string>;
	};
	export let setValue: (
		val: Array<Array<string | number>>
	) => Array<Array<string | number>> = (v) => v;
</script>

<DataFrame
	headers={headers || value.headers}
	values={value.data}
	{setValue}
	editable={false}
/>
