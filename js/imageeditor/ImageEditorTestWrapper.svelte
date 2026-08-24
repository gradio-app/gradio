<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { writable } from "svelte/store";
	import Controls from "./shared/Controls.svelte";
	import SecondaryToolbar from "./shared/SecondaryToolbar.svelte";
	import Toolbar from "./shared/Toolbar.svelte";

	let {
		props
	}: {
		props: {
			kind: "controls" | "toolbar" | "layers";
			i18n: I18nFormatter;
		};
	} = $props();

	const layers = writable({
		active_layer: "layer-1",
		layers: [
			{ name: "Layer 1", id: "layer-1", user_created: false, visible: true }
		]
	});
</script>

{#if props.kind === "controls"}
	<Controls
		i18n={props.i18n}
		tool="image"
		can_undo={false}
		can_redo={false}
		enable_download={true}
		changeable={true}
	/>
{:else if props.kind === "toolbar"}
	<Toolbar
		i18n={props.i18n}
		brush_options={{
			default_size: "auto",
			colors: ["#000000"],
			default_color: "#000000",
			color_mode: "defaults"
		}}
		eraser_options={{ default_size: "auto" }}
		sources={["upload", "clipboard", "webcam"]}
		transforms={[]}
		background={false}
	/>
{:else}
	<SecondaryToolbar i18n={props.i18n} {layers} />
{/if}
