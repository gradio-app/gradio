<script lang="ts">
	import { Plot } from "@gradio/plot";

	export let value: null | string = null;
	export let default_value: null | string = null;
	export let style: string = "";

	export let loading_status: LoadingStatus;

	if (default_value) value = default_value;
</script>

<Plot {value} {style} on:change />
