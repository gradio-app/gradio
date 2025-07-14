<script>
	import { onMount } from "svelte";

	let gradio_container;

	onMount(() => {
		import("@self/spa/webcomponent");
		gradio_container = document.querySelector("gradio-container");
	});
</script>

<h2>Embeds</h2>
<!-- 
<div>
	<gradio-app src="http://localhost:7860/"></gradio-app>
</div> -->

<iframe src="http://localhost:9876/" width="100%" height="500px"></iframe>
