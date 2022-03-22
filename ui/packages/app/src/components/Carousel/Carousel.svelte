<script lang="ts">
	import { Carousel } from "@gradio/carousel";

	export let theme: string;
	export let style: string | null;
</script>

<Carousel {theme} {style} on:change>
	<slot />
</Carousel>
