<script lang="ts">
	import { Carousel, CarouselItem } from "@gradio/carousel";
	import cheetah from "../assets/cheetah1.jpg";
</script>

<Carousel>
	<CarouselItem>
		<h1>hello</h1>
	</CarouselItem>
	<CarouselItem>
		<img src={cheetah} alt="" />
	</CarouselItem>
</Carousel>
