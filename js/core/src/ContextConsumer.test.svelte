<script lang="ts">
	import { getContext } from "svelte";

	const value = getContext<string>("custom-component-context");
</script>

<p>Context: {value ?? "missing"}</p>
