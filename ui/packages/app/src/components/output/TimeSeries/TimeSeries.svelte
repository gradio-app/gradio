<script lang="ts">
	import Chart from "../../utils/Chart.svelte";

	export let value: { data: Array<Array<string>>; headers: Array<string> };

	$: formatted_value = value.data.map((r) =>
		r.reduce((acc, next, i) => ({ ...acc, [value.headers[i]]: next }), {})
	);
</script>

<Chart value={formatted_value} />
