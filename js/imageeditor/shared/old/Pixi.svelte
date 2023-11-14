<script context="module" lang="ts">
	export type coords = { x: number; y: number };
</script>

<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import * as PIXI from "pixi.js";
	import { prepare_files, upload } from "@gradio/client";

	import type { EditorData, Brush, PathData } from "./types";

	let stage: HTMLDivElement;

	let app: PIXI.Application;

	let container: PIXI.Container;
	let bg_sprite: PIXI.Sprite;
	export let bg: string | undefined;

	export let antialias = true;

	export let root: string;

	// export function clear(): void {

	// 	bg_sprite.destroy();
	// 	graphics.forEach((g) => g.destroy());
	// 	graphics = [];
	// }

	export function get_container(): PIXI.Container {
		return container;
	}

	export function get_renderer(): PIXI.IRenderer {
		return app.renderer;
	}

	export function get_stage(): PIXI.Container {
		return app.stage;
	}

	PIXI.Rectangle;

	const dispatch = createEventDispatcher<{
		change: EditorData;
		draw_start: coords;
		draw_continue: coords;
		draw_end: coords;
		add_image?: never;
	}>();

	let graphics: PIXI.Graphics[] = [];

	const ratio = window.devicePixelRatio || 1;

	onMount(() => {
		make_pixi();
	});

	// function make_graphics(i: number): PIXI.Graphics {
	// 	const graphics = new PIXI.Graphics();
	// 	graphics.zIndex = i + 1;
	// 	container.addChild(graphics);
	// 	return graphics;
	// }

	function make_pixi(): void {
		app = new PIXI.Application({
			width: 800,
			height: 600,
			backgroundColor: 0xffffff,
			// resolution: ratio,
			antialias: antialias,
			eventMode: "static"
		});
		//@ts-ignore
		app.view.style!.maxWidth = "800px";
		//@ts-ignore
		app.view.style!.maxHeight = "600px";
		app.view.style!.width = "100%";
		app.view.style!.height = "100%";
		//@ts-ignore
		app.stage.eventMode = "static";

		stage.appendChild(app.view);
		container = new PIXI.Container();
		container.sortableChildren = true;
		app.stage.sortableChildren = true;
		app.stage.addChild(container);

		container.on("pointerdown", function (event) {
			drawing = true;

			dispatch("draw_start", { x: event.screen.x, y: event.screen.y });
		});

		container.on("pointerup", function (event) {
			dispatch("draw_end", { x: event.screen.x, y: event.screen.y });
			drawing = false;
		});

		container.on("pointermove", function (event) {
			if (drawing) {
				dispatch("draw_continue", { x: event.screen.x, y: event.screen.y });
			}
		});
	}

	let value: EditorData = {
		background: null,
		layers: [],
		composite: null
	};

	export let pixi_height = 0;
	export let pixi_width = 0;

	async function add_bg(): Promise<void> {
		const a = await PIXI.Assets.load(encodeURI(bg!));

		bg_sprite = new PIXI.Sprite(a);

		app.renderer.resize(bg_sprite.width, bg_sprite.height);
		pixi_height = bg_sprite.height;
		pixi_width = bg_sprite.width;
		//@ts-ignore
		app.view.style!.maxWidth = `${bg_sprite.width / ratio}px`;
		//@ts-ignore
		app.view.style!.maxHeight = `${bg_sprite.height / ratio}px`;
		bg_sprite.zIndex = 0;
		container.addChild(bg_sprite);

		make_file(bg_sprite, "background");
		make_file(container, "composite");
		dispatch("add_image");
		// @ts-ignore
	}

	async function make_file(
		obj: PIXI.DisplayObject | PIXI.RenderTexture,
		type: "background" | "layers" | "composite",
		index?: number
	): Promise<void> {
		//@ts-ignore
		app.renderer.extract
			.canvas(obj, new PIXI.Rectangle(0, 0, container.width, container.height))
			.toBlob(async (blob) => {
				if (!blob) return;
				const data = await upload(
					await prepare_files([new File([blob], "background.png")]),
					root
				);

				if (!data || !data[0]) return;

				if (type === "background") {
					value.background = data[0];
				} else if (type === "composite") {
					value.composite = data[0];
				} else {
					value.layers[index!] = data[0];
				}

				dispatch("change", value);
			});
	}

	let drawing = false;
	let points: { x: number; y: number }[] = [];
	let last_point: { x: number; y: number } | null = null;

	$: bg && add_bg();
</script>

<div class="wrap">
	<div bind:this={stage} class="stage-wrap"></div>
</div>

<style>
	.wrap {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.stage-wrap {
		margin: var(--size-8);
		margin-bottom: var(--size-1);
		border: var(--block-border-color) 1px solid;
	}
</style>
