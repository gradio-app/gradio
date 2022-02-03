<script>
	import DataFrame from "../../input/DataFrame/Component.svelte";

	export let headers,
		value,
		theme,
		setValue = () => {};
</script>

<DataFrame
	headers={headers || value.headers}
	values={value.data}
	{setValue}
	editable={false}
	{theme}
/>
