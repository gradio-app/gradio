<!-- Configuration-only component that stores navbar props in a global store. The actual navbar UI is in Embed.svelte -->
<script lang="ts">
	import type { NavbarProps, NavbarEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { navbar_config } from "@gradio/core/navbar_store";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	const props = $props();
	const gradio = new Gradio<NavbarEvents, NavbarProps>(props);

	let navbar_props = $derived.by(() => {
		return {
			visible: gradio.shared.visible,
			main_page_name: gradio.props.main_page_name ?? "Home",
			value: gradio.props.value
		};
	});

	onMount(() => {
		const current_store = get(navbar_config);
		if (!current_store) {
			navbar_config.set(navbar_props);
		}
	});

	$effect(() => {
		navbar_config.set(navbar_props);
	});
</script>

<div
	style="display: none;"
	id={gradio.shared.elem_id}
	class={gradio.shared.elem_classes.join(" ")}
></div>
