<script lang="ts">
	import { getContext, onMount, tick, createEventDispatcher } from "svelte";
	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import {
		Image as ImageIcon,
		Webcam as WebcamIcon,
		ImagePaste
	} from "@gradio/icons";
	import { Upload } from "@gradio/upload";
	import { Webcam } from "@gradio/image";
	import { type I18nFormatter } from "@gradio/utils";
	import { IconButton } from "@gradio/atoms";
	import { type Client } from "@gradio/client";

	import { add_bg_color, add_bg_image } from "./sources";
	import type { FileData } from "@gradio/client";

	export let background_file: FileData | null;
	export let root: string;
	export let sources: ("upload" | "webcam" | "clipboard")[] = [
		"upload",
		"webcam",
		"clipboard"
	];
	export let mirror_webcam = true;
	export let i18n: I18nFormatter;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let dragging: boolean;

	const { active_tool } = getContext<ToolContext>(TOOL_KEY);
	const { pixi, dimensions, register_context, reset, editor_box } =
		getContext<EditorContext>(EDITOR_KEY);

	export let active_mode: "webcam" | "color" | null = null;
	let background: Blob | File | null;

	const dispatch = createEventDispatcher<{
		upload: never;
	}>();

	const sources_meta = {
		upload: {
			icon: ImageIcon,
			label: "Upload",
			order: 0,
			id: "bg_upload",
			cb() {
				upload_component.open_file_upload();

				$active_tool = "bg";
			}
		},
		webcam: {
			icon: WebcamIcon,
			label: "Webcam",
			order: 1,
			id: "bg_webcam",
			cb() {
				active_mode = "webcam";
				$active_tool = "bg";
			}
		},
		clipboard: {
			icon: ImagePaste,
			label: "Paste",
			order: 2,
			id: "bg_clipboard",
			cb() {
				process_clipboard();
				$active_tool = null;
			}
		}
	} as const;

	$: sources_list = sources
		.map((src) => sources_meta[src])
		.sort((a, b) => a.order - b.order);

	let upload_component: Upload;

	async function process_clipboard(): Promise<void> {
		const items = await navigator.clipboard.read();

		for (let i = 0; i < items.length; i++) {
			const type = items[i].types.find((t) => t.startsWith("image/"));
			if (type) {
				const blob = await items[i].getType(type);

				background = blob || null;
			}
		}
	}

	function handle_upload(e: CustomEvent<Blob | any>): void {
		const file_data = e.detail;
		background = file_data;
		active_mode = null;
	}

	let should_reset = true;

	async function set_background(): Promise<void> {
		if (!$pixi) return;
		if (background) {
			const add_image = add_bg_image(
				$pixi.background_container,
				$pixi.renderer,
				background,
				$pixi.resize
			);
			$dimensions = await add_image.start();

			if (should_reset) {
				reset(false, $dimensions);
			}

			add_image.execute();

			should_reset = true;

			await tick();
			bg = true;
		}
	}

	async function process_bg_file(file: FileData | null): Promise<void> {
		if (!file || !file.url) return;
		should_reset = false;

		const blob_res = await fetch(file.url);
		const blob = await blob_res.blob();
		background = blob;
	}

	function handle_key(e: KeyboardEvent): void {
		if (e.key === "Escape") {
			active_mode = null;
		}
	}

	$: background && set_background();
	$: process_bg_file(background_file);

	export let bg = false;

	register_context("bg", {
		init_fn: () => {
			if (!$pixi) return;

			const add_image = add_bg_color(
				$pixi.background_container,
				$pixi.renderer,
				"black",
				...$dimensions,
				$pixi.resize
			);
			$dimensions = add_image.start();
			add_image.execute();
		},
		reset_fn: () => {}
	});
</script>

<svelte:window on:keydown={handle_key} />

{#if sources.length}
	<div class="source-wrap">
		{#each sources_list as { icon, label, id, cb } (id)}
			<IconButton
				Icon={icon}
				size="medium"
				padded={false}
				label={label + " button"}
				hasPopup={true}
				transparent={true}
				on:click={cb}
			/>
		{/each}
		<span class="sep"></span>
	</div>
	<div
		class="upload-container"
		class:click-disabled={!!bg ||
			active_mode === "webcam" ||
			$active_tool !== "bg"}
		style:height="{$editor_box.child_height +
			($editor_box.child_top - $editor_box.parent_top)}px"
	>
		<Upload
			hidden={bg || active_mode === "webcam" || $active_tool !== "bg"}
			bind:this={upload_component}
			filetype="image/*"
			on:load={handle_upload}
			on:error
			bind:dragging
			{root}
			disable_click={!sources.includes("upload")}
			format="blob"
			{upload}
			{stream_handler}
		></Upload>
		{#if active_mode === "webcam"}
			<div
				class="modal"
				style:max-width="{$editor_box.child_width}px"
				style:max-height="{$editor_box.child_height}px"
				style:top="{$editor_box.child_top - $editor_box.parent_top}px"
			>
				<div class="modal-inner">
					<Webcam
						{upload}
						{root}
						on:capture={handle_upload}
						on:error
						on:drag
						{mirror_webcam}
						streaming={false}
						mode="image"
						include_audio={false}
						{i18n}
					/>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.modal {
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0;
		right: 0;
		margin: auto;
		z-index: var(--layer-top);
		display: flex;
		align-items: center;
	}

	.modal-inner {
		width: 100%;
	}

	.sep {
		height: 12px;
		background-color: var(--block-border-color);
		width: 1px;
		display: block;
		margin-left: var(--spacing-xl);
	}

	.source-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: var(--spacing-lg);
		height: 100%;
	}

	.upload-container {
		position: absolute;
		height: 100%;
		flex-shrink: 1;
		max-height: 100%;
		width: 100%;
		left: 0;
		top: 0;
	}

	.upload-container.click-disabled {
		pointer-events: none;
	}
</style>
