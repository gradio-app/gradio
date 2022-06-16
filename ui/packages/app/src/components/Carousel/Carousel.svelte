<script lang="ts">
	import { Carousel } from "@gradio/carousel";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let loading_status: LoadingStatus;
</script>

<Carousel {elem_id} {visible} on:change>
	<StatusTracker {...loading_status} />

	<slot />
</Carousel>
