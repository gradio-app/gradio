<script lang="ts">
	import { Carousel } from "@gradio/carousel";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let style: string = "";
	export let loading_status: LoadingStatus;
</script>

<Carousel {style} on:change>
	<StatusTracker {...loading_status} />

	<slot />
</Carousel>
