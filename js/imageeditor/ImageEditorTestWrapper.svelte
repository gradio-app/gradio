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
			i18n?: I18nFormatter;
			[key: string]: any;
		};
	} = $props();

	const identity: I18nFormatter = (s: string) => s;

	const default_brush = {
		default_size: "auto" as const,
		colors: ["#000000"],
		default_color: "#000000",
		color_mode: "defaults" as const
	};

	const layers = writable(
		props.layer_store ?? {
			active_layer: "layer-1",
			layers: [
				{ name: "Layer 1", id: "layer-1", user_created: false, visible: true }
			]
		}
	);
</script>

{#if props.kind === "controls"}
	<Controls
		i18n={props.i18n ?? identity}
		tool={props.tool ?? "image"}
		can_undo={props.can_undo ?? false}
		can_redo={props.can_redo ?? false}
		can_save={props.can_save ?? false}
		enable_download={props.enable_download ?? true}
		changeable={props.changeable ?? true}
		current_zoom={props.current_zoom ?? 1}
		onundo={props.onundo}
		onredo={props.onredo}
		onsave={props.onsave}
		onremove_image={props.onremove_image}
		ondownload={props.ondownload}
		onzoom_in={props.onzoom_in}
		onzoom_out={props.onzoom_out}
		onpan={props.onpan}
	/>
{:else if props.kind === "toolbar"}
	<Toolbar
		i18n={props.i18n ?? identity}
		brush_options={props.brush_options === undefined
			? default_brush
			: props.brush_options}
		eraser_options={props.eraser_options === undefined
			? { default_size: "auto" }
			: props.eraser_options}
		sources={props.sources ?? ["upload", "clipboard", "webcam"]}
		transforms={props.transforms ?? []}
		background={props.background ?? false}
		tool={props.tool ?? "image"}
		subtool={props.subtool ?? null}
		ontool_change={props.ontool_change}
		onsubtool_change={props.onsubtool_change}
	/>
{:else}
	<SecondaryToolbar
		i18n={props.i18n ?? identity}
		{layers}
		enable_layers={props.enable_layers ?? true}
		enable_additional_layers={props.enable_additional_layers ?? true}
		onnew_layer={props.onnew_layer}
	/>
{/if}
