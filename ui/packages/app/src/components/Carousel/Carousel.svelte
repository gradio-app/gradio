<script lang="ts">
	import { Carousel } from "@gradio/carousel";

	export let theme: string;
</script>

<Carousel {theme} on:change>
	<slot />
</Carousel>
