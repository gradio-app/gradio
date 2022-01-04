<script>
	import Interface from "./Interface.svelte";

	export let title;
	export let description;
	export let theme;
	export let input_components;
	export let output_components;
</script>

<div class="gradio_bg" {theme}>
  <div class="gradio_page">
    <div class="content">
		{#if title !== undefined}
			<h1 class="title">{title}</h1>
		{/if}
		{#if description !== undefined}
			<p class="description">{description}</p>
		{/if}
		<Interface input_components={input_components} output_components={output_components} />
 	</div>
  </div>
</div>

<style global lang="scss">
	@import "./style/base";
	@import "./style/default";
</style>