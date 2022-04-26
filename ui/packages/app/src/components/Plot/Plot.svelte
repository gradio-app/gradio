<script lang="ts">
	import { Plot } from "@gradio/plot";

	export let value: null | string = null;
	export let style: string = "";
</script>

<Plot {value} {style} on:change />
