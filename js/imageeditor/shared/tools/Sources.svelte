<script lang="ts">
	import { Toolbar } from "@gradio/atoms";
	import { getContext, onDestroy } from "svelte";
	import { Assets, Sprite, Texture } from "pixi.js";
	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import {
		Upload as UploadIcon,
		Webcam as WebcamIcon,
		ImagePaste,
		Palette,
		Image as ImageIcon
	} from "@gradio/icons";
	import { Upload } from "@gradio/upload";
	import { Webcam } from "@gradio/image";
	import ColorSwatch from "./BrushColor.svelte";
	import { type I18nFormatter } from "@gradio/utils";

	import { add_bg_color, add_bg_image } from "./sources";

	const { active_tool, register_tool } = getContext<ToolContext>(TOOL_KEY);
	const { pixi, dimensions } = getContext<EditorContext>(EDITOR_KEY);

	export let root: string;
	export let sources: ("upload" | "webcam" | "clipboard" | "color")[] = [
		"upload",
		"webcam",
		"clipboard",
		"color"
	];
	export let mirror_webcam = true;
	export let i18n: I18nFormatter;

	let active_mode: "webcam" | "color" | null = null;
	let background: Blob | File | string | null;

	const sources_meta = {
		upload: {
			icon: UploadIcon,
			label: "Upload",
			order: 0,
			id: "bg_upload",
			cb() {
				upload.open_file_upload();
			}
		},
		webcam: {
			icon: WebcamIcon,
			label: "Webcam",
			order: 1,
			id: "bg_webcam",
			cb() {
				active_mode = "webcam";
			}
		},
		clipboard: {
			icon: ImagePaste,
			label: "Paste",
			order: 2,
			id: "bg_clipboard",
			cb() {
				process_clipboard();
			}
		},
		color: {
			icon: Palette,
			label: "Color",
			order: 3,
			id: "bg_color",
			cb() {
				active_mode = "color";
			}
		}
	} as const;

	$: sources_list = sources
		.map((src) => sources_meta[src])
		.sort((a, b) => a.order - b.order);

	$: unregister = register_tool("bg", {
		default: "bg_upload",
		options: sources_list || []
	});

	onDestroy(unregister);

	let upload: Upload;

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

	function handle_upload(e: CustomEvent<Blob>): void {
		const file_data = e.detail;
		background = file_data;
		active_mode = null;
	}

	async function set_background(): Promise<void> {
		if (!$pixi) return;
		if (typeof background === "string") {
			const add_color = add_bg_color(
				$pixi.background_container,
				$pixi.renderer,
				background,
				...$dimensions,
				$pixi.resize
			);

			add_color.start();
			add_color.execute();

			$pixi?.reset?.();
		} else if (background) {
			const add_image = add_bg_image(
				$pixi.background_container,
				$pixi.renderer,
				background,
				$pixi.resize
			);

			$dimensions = await add_image.start();
			add_image.execute();

			$pixi?.reset?.();
		}
	}

	$: background && set_background();
</script>

{#if $active_tool === "bg"}
	<div class="upload-container">
		<Upload
			hidden={true}
			bind:this={upload}
			filetype="image/*"
			on:load={handle_upload}
			on:error
			{root}
			disable_click={!sources.includes("upload")}
			format="blob"
		></Upload>
		{#if active_mode === "webcam"}
			<Webcam
				on:capture={handle_upload}
				on:error
				on:drag
				{mirror_webcam}
				streaming={false}
				mode="image"
				include_audio={false}
				{i18n}
			/>
		{:else if active_mode === "color"}
			<ColorSwatch colors={[]} selected_color={"black"} />
		{/if}
	</div>
{/if}
