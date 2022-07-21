<script>
	// @ts-nocheck
	import Carousel from "./Carousel.svelte";
	import CarouselItem from "../CarouselItem/CarouselItem.svelte";
	import api_logo from "../../../public/static/img/api-logo.svg";
</script>

<Carousel on:change loading_status="complete">
	<CarouselItem>
		<h1>Item 1</h1>
	</CarouselItem>

	<CarouselItem>
		<img src={api_logo} alt="" />
	</CarouselItem>
</Carousel>
