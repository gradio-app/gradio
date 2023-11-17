<script lang="ts">
	import { getContext, onDestroy, onMount, tick } from "svelte";

	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import { crop_canvas, type CropCommand } from "./crop";

	import Cropper from "./Cropper.svelte";

	const { active_tool, register_tool } = getContext<ToolContext>(TOOL_KEY);
	const { dimensions, editor_box, pixi, crop, command_manager } =
		getContext<EditorContext>(EDITOR_KEY);

	let cropper: CropCommand | null;

	export let crop_constraint: [number, number] | `${string}:${string}` | null;

	$: {
		if (typeof crop_constraint === "string") {
			const [w, h] = crop_constraint.split(":");
			crop_constraint = [parseInt(w), parseInt(h)];
		}
	}

	let w_p = 1;
	let h_p = 1;
	let l_p = 0;
	let t_p = 0;

	let current_opacity = 0;

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

		if (type === "start") {
			if (cropper) {
				current_opacity = cropper.stop();
				cropper = null;
			}

			cropper = crop_canvas(
				$pixi?.renderer,
				$pixi.mask_container,
				crop,
				current_opacity
			);
			cropper.start(...$dimensions, current_crop);
		} else if (type === "continue") {
			if (!cropper) return;
			cropper.continue([
				x * $dimensions[0],
				y * $dimensions[1],
				width * $dimensions[0],
				height * $dimensions[1]
			]);
		} else if (type === "stop") {
			if (!cropper) return;
			command_manager.execute(cropper);
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
			options: []
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
