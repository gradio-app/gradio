<script lang="ts">
	import { Carousel, CarouselItem } from "@gradio/carousel";
	import cheetah from "../assets/cheetah1.jpg";
</script>

<Carousel>
	<CarouselItem label="zaeeaz">
		<img src="http://placehold.jp/150x1500.png" alt="" />
	</CarouselItem>
	<CarouselItem label="zaeeaz">
		<img src="http://placehold.jp/1500x400.png" alt="" />
	</CarouselItem>
	<CarouselItem>
		<h1>hello</h1>
	</CarouselItem>
	<CarouselItem label="zaeeaz">
		<img src={cheetah} alt="" />
	</CarouselItem>
</Carousel>
