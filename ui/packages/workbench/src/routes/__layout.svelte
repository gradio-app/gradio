<script>
	import "../app.css";
	import * as _ from "@gradio/theme";
	import Nav from "./_Nav.svelte";
</script>

<h1 class="font-mono p-4 text-lg text-right">workbench</h1>
<div class="flex p-2">
	<Nav />

	<main class="gradio-bg ml-5 w-full" theme="default">
		<div class="gradio-interface">
			<slot />
		</div>
	</main>
</div>
