<script lang="ts">
	import { Carousel } from "@gradio/carousel";

	export let style: string = "";
</script>

<Carousel {style} on:change>
	<slot />
</Carousel>
