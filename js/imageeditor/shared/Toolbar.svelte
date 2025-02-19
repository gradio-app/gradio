<script lang="ts" context="module">
	export type Tool = "image" | "draw" | "erase" | "pan";
	export type Subtool =
		| "upload"
		| "paste"
		| "webcam"
		| "color"
		| "size"
		| "crop"
		| null;
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import IconButton from "./IconButton.svelte";
	import Layers from "./Layers.svelte";
	import {
		Image,
		// ZoomIn,
		// ZoomOut,
		Brush,
		Erase,
		Crop,
		Undo,
		Redo,
		Upload,
		ImagePaste,
		Webcam,
		Color,
		Circle,
		Maximise,
		Resize,
		Trash,
	} from "@gradio/icons";

	let tool: Tool = "image";
	let subtool: Subtool = null;

	export let background = false;

	let enable_layers = true;
	const dispatch = createEventDispatcher<{
		tool_change: { tool: Tool };
		subtool_change: {
			tool: Tool;
			subtool: Subtool;
		};
	}>();

	function handle_tool_click(e: Event, _tool: typeof tool): void {
		e.stopPropagation();
		tool = _tool;
		dispatch("tool_change", { tool });
	}

	function handle_subtool_click(e: Event, _subtool: typeof subtool): void {
		e.stopPropagation();
		subtool = _subtool;
		dispatch("subtool_change", { tool, subtool });
	}
</script>

<div class="toolbar-wrap">
	<div class="half-container left">
		<Layers {enable_layers} />
		<div class="toolbar-left" class:toolbar-layers={enable_layers}>
			<IconButton
				Icon={Image}
				label="Image"
				highlight={tool === "image"}
				on:click={(e) => handle_tool_click(e, "image")}
				size="medium"
				padded={false}
				transparent={true}
			/>
			<IconButton
				Icon={Maximise}
				label="Maximise"
				on:click={(e) => handle_tool_click(e, "pan")}
				highlight={tool === "pan"}
				size="medium"
				padded={false}
				transparent={true}
			/>
			<IconButton
				Icon={Brush}
				label="Brush"
				on:click={(e) => handle_tool_click(e, "draw")}
				highlight={tool === "draw"}
				size="medium"
				padded={false}
				transparent={true}
			/>
			<IconButton
				Icon={Erase}
				label="Erase"
				on:click={(e) => handle_tool_click(e, "erase")}
				highlight={tool === "erase"}
				size="medium"
				padded={false}
				transparent={true}
			/>
		</div>
	</div>
	<div class="half-container right">
		<div class="toolbar-right">
			{#if tool === "image"}
				{#if background}
					<IconButton
						Icon={Trash}
						label="Remove Background"
						on:click={(e) => handle_subtool_click(e, "remove_background")}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
					<IconButton
						Icon={Crop}
						label="Crop"
						on:click={(e) => handle_subtool_click(e, "crop")}
						highlight={subtool === "crop"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
					<IconButton
						Icon={Resize}
						label="Resize"
						on:click={(e) => handle_subtool_click(e, "size")}
						highlight={subtool === "size"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{:else}
					<IconButton
						Icon={Upload}
						label="Upload"
						on:click={(e) => handle_subtool_click(e, "upload")}
						highlight={subtool === "upload"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
					<IconButton
						Icon={ImagePaste}
						label="Paste"
						on:click={(e) => handle_subtool_click(e, "paste")}
						highlight={subtool === "paste"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
					<IconButton
						Icon={Webcam}
						label="Webcam"
						on:click={(e) => handle_subtool_click(e, "webcam")}
						highlight={subtool === "webcam"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
			{/if}

			{#if tool === "draw"}
				<IconButton
					Icon={Color}
					label="Color"
					on:click={(e) => handle_subtool_click(e, "color")}
					highlight={subtool === "color"}
					size="medium"
					padded={false}
					transparent={true}
					offset={0}
				/>
				<IconButton
					Icon={Circle}
					label="Brush Size"
					on:click={(e) => handle_subtool_click(e, "size")}
					highlight={subtool === "size"}
					size="medium"
					padded={false}
					transparent={true}
					offset={0}
				/>
			{/if}

			{#if tool === "erase"}
				<IconButton
					Icon={Circle}
					label="Eraser Size"
					on:click={(e) => handle_subtool_click(e, "size")}
					highlight={subtool === "size"}
					size="medium"
					padded={false}
					transparent={true}
					offset={0}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.toolbar-wrap {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 10px;
		width: 100%;
	}

	.half-container {
		flex: 1;
		display: flex;
	}

	.half-container.left {
		justify-content: flex-end;
	}

	.half-container.right {
		justify-content: flex-start;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--spacing-sm);
		border: 1px solid var(--block-border-color);
		display: flex;
		z-index: 1000;
		border-radius: var(--radius-sm);
		background-color: #fff;
		padding: var(--spacing-sm) 0.3rem;
		width: auto;
	}

	.toolbar-right {
		border-left: 0;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.toolbar-left {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.toolbar-layers {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
</style>
