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
	export let layers: PathData[][];
	export let brush_size: number;
	export let brush_color: string | [number, number, number, number];
	export let antialias = true;
	export let current_layer: number;
	export let root: string;

	export function clear(): void {
		layers = [];
		current_layer = 0;
		bg_sprite.destroy();
		graphics.forEach((g) => g.destroy());
		graphics = [];
	}

	PIXI.Rectangle;

	const dispatch = createEventDispatcher<{
		change: EditorData;
	}>();

	let graphics: PIXI.Graphics[] = [];

	const ratio = window.devicePixelRatio || 1;

	onMount(() => {
		make_pixi();
	});

	function make_graphics(i: number): PIXI.Graphics {
		const graphics = new PIXI.Graphics();
		graphics.zIndex = i + 1;
		container.addChild(graphics);
		return graphics;
	}

	function make_pixi(): void {
		app = new PIXI.Application({
			width: 800,
			height: 600,
			backgroundColor: 0xffffff,
			resolution: ratio,
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
		stage.appendChild(app.view);
		container = new PIXI.Container();
		container.sortableChildren = true;
		app.stage.addChild(container);

		container.on("pointerdown", function (event) {
			if (!graphics[current_layer]) {
				graphics[current_layer] = make_graphics(current_layer);
			}

			layers[current_layer].push({
				path: [],
				color: brush_color,
				size: brush_size
			});

			drawing = true;
			last_point = { x: event.global.x, y: event.global.y };

			drawCircle(event.global.x, event.global.y);
		});

		container.on("pointerup", function (event) {
			drawing = false;
			last_point = null;
			make_file(graphics[current_layer], "layers", current_layer);
			make_file(container, "composite");
		});

		container.on("pointermove", function (event) {
			if (drawing && last_point) {
				let newPoint = { x: event.global.x, y: event.global.y };

				interpolate(last_point, newPoint);
				last_point = newPoint;
			}
		});
	}

	function drawCircle(x: number, y: number): void {
		graphics[current_layer].beginFill(brush_color);
		graphics[current_layer].drawCircle(x, y, brush_size);
		graphics[current_layer].endFill();
	}

	function interpolate(
		point1: { x: number; y: number },
		point2: { x: number; y: number }
	): void {
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const steps = Math.ceil(distance / (2 * ratio));
		const stepX = dx / steps;
		const stepY = dy / steps;

		for (let j = 0; j < steps; j++) {
			const x = point1.x + j * stepX;
			const y = point1.y + j * stepY;
			drawCircle(x, y);
			layers[current_layer][layers[current_layer].length - 1].path.push({
				x,
				y
			});
		}
	}

	let value: EditorData = {
		background: null,
		layers: [],
		composite: null
	};

	async function add_bg(): Promise<void> {
		const a = await PIXI.Assets.load(encodeURI(bg!));

		bg_sprite = new PIXI.Sprite(a);

		app.renderer.resize(bg_sprite.width, bg_sprite.height);
		//@ts-ignore
		app.view.style!.maxWidth = `${bg_sprite.width}px`;
		//@ts-ignore
		app.view.style!.maxHeight = `${bg_sprite.height}px`;
		bg_sprite.zIndex = 1;
		container.addChild(bg_sprite);

		make_file(bg_sprite, "background");
		make_file(container, "composite");

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
