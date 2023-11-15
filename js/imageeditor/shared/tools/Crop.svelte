<script lang="ts">
	import { getContext, onDestroy, onMount, tick } from "svelte";
	import { Rotate, Crop } from "@gradio/icons";

	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import { crop_canvas, type CropCommand } from "./crop";

	import Cropper from "./Cropper.svelte";

	const { active_tool, register_tool } = getContext<ToolContext>(TOOL_KEY);
	const { dimensions, editor_box, pixi, crop, command_manager } =
		getContext<EditorContext>(EDITOR_KEY);

	export let transforms: ("crop" | "rotate")[] = ["crop", "rotate"];

	const transform_meta = {
		rotate: {
			icon: Rotate,
			label: "Rotate",
			order: 0,
			id: "rotate",
			cb: () => {}
		},
		crop: {
			icon: Crop,
			label: "Crop",
			order: 1,
			id: "crop",
			cb: () => {}
		}
	} as const;

	$: _transforms = transforms
		.map((transform) => ({
			...transform_meta[transform]
		}))
		.sort((a, b) => a.order - b.order);

	let cropper: CropCommand | null;

	let w_p = 1;
	let h_p = 1;
	let l_p = 0;
	let t_p = 0;

	function handle_crop(
		type: "start" | "stop" | "continue",

		{
			x,
			y,
			width,
			height
		}: {
			x: number;
			y: number;
			width: number;
			height: number;
		}
	): void {
		if (!$pixi) return;
		if (!cropper) {
			cropper = crop_canvas($pixi?.renderer, $pixi.mask_container, crop);
		}

		if (type === "start") {
			cropper.start(...$dimensions, current_crop);
		} else if (type === "continue") {
			cropper.continue([
				x * $dimensions[0],
				y * $dimensions[1],
				width * $dimensions[0],
				height * $dimensions[1]
			]);
		} else if (type === "stop") {
			command_manager.execute(cropper);

			// current_crop = [
			// 	x * $dimensions[0],
			// 	y * $dimensions[1],
			// 	width * $dimensions[0],
			// 	height * $dimensions[1]
			// ];
			cropper = null;

			w_p = width;
			h_p = height;
			l_p = x;
			t_p = y;
		}
	}

	let measured = false;

	function get_measurements(): void {
		if (measured) return;
		if (!$editor_box.child_height) return;
		const _height = $editor_box.child_height;
		const _width = $editor_box.child_width;
		const _top = $editor_box.child_top - $editor_box.parent_top;
		const _left = $editor_box.child_left - $editor_box.parent_left;

		w_p = _width / $editor_box.child_width;
		h_p = _height / $editor_box.child_height;
		l_p =
			(_left - $editor_box.child_left + $editor_box.parent_left) /
			$editor_box.child_width;
		t_p =
			(_top - $editor_box.child_top + $editor_box.parent_top) /
			$editor_box.child_height;

		measured = true;
	}

	let current_crop: [number, number, number, number];
	$: current_crop = [
		l_p * $dimensions[0],
		t_p * $dimensions[1],
		w_p * $dimensions[0],
		h_p * $dimensions[1]
	];

	// $: crop.set([l_p, t_p, w_p, h_p]);

	$: {
		l_p = $crop[0];
		t_p = $crop[1];
		w_p = $crop[2];
		h_p = $crop[3];
	}

	$: $editor_box && get_measurements();

	onMount(() =>
		register_tool("crop", {
			default: "crop",
			options: _transforms || []
		})
	);
</script>

{#if $active_tool === "crop" && measured}
	<Cropper
		{w_p}
		{h_p}
		{l_p}
		{t_p}
		{editor_box}
		on:crop_start={({ detail }) => handle_crop("start", detail)}
		on:crop_continue={({ detail }) => handle_crop("continue", detail)}
		on:crop_end={({ detail }) => handle_crop("stop", detail)}
	/>
{/if}

<style>
</style>
