<script lang="ts">
	import { Plot } from "@gradio/plot";

	export let value: null | string = null;

	export let loading_status: LoadingStatus;
</script>

<Plot {value}  on:change />
