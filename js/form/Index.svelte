<script context="module" lang="ts">
	export { default as BaseForm } from "./BaseForm.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import BaseForm from "./BaseForm.svelte";

	let props = $props();
	const gradio = new Gradio(props);
</script>

<BaseForm
	visible={gradio.shared.visible}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<slot />
</BaseForm>
