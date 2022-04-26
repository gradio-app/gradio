<script lang="ts">
	import { Carousel } from "@gradio/carousel";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";

	export let style: string = "";
	export let loading_status: "complete" | "pending" | "error";
</script>

<Carousel {style} on:change>
	<StatusTracker tracked_status={loading_status} />

	<slot />
</Carousel>
