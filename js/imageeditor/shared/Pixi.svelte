<script lang="ts">
	import { onMount } from "svelte";
	import * as PIXI from "pixi.js";

	import type { EditorData, Brush } from "./types";

	let stage: HTMLDivElement;

	let app: PIXI.Application;
	let graphics: PIXI.Graphics;
	let container: PIXI.Container;

	export let bg: string | undefined;
	export let layers: EditorData["layers"] | undefined;
	export let composite: EditorData["composite"] | undefined;
	export let brush_size: number;
	export let brush_color: string | [number, number, number, number];
	export let antialias: boolean = true;

	$: console.log(encodeURI(bg), layers, composite);

	const ratio = window.devicePixelRatio || 1;

	onMount(() => {
		make_pixi();
	});

	function make_pixi() {
		app = new PIXI.Application({
			width: 800,
			height: 600,
			backgroundColor: 0xffffff,
			resolution: ratio,
			antialias: true,
			eventMode: "static"
		});
		app.view.style!.maxWidth = "800px";
		app.view.style!.maxHeight = "600px";
		app.view.style!.width = "100%";
		app.view.style!.height = "100%";
		console.log(app.view);
		stage.appendChild(app.view);
		container = new PIXI.Container();
		container.sortableChildren = true;
		app.stage.addChild(container);

		// container.scale.set(0.5, 0.5);
		graphics = new PIXI.Graphics();

		graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);

		graphics.endFill();
		graphics.cursor = "pointer";
		graphics.zIndex = 2;

		container.addChild(graphics);
		// graphics.cursor = "crosshair";

		// BUG
		// Interactions added to the child
		graphics.eventMode = "static";
		// graphic
		// 	// .on("pointertap", (e) => console.log("pointertap"))
		// 	.on("pointerdown", (e) => console.log("pointerdown"))
		// 	.on("pointermove", (e) => console.log("move asdasd"))
		// 	.on("pointerup", (e) => console.log("pointerup"))
		// 	.on("pointerout", (e) => console.log("pointerout"))
		// 	.on("pointerupoutside", (e) => console.log("pointerupoutside"));
		container.on("pointerdown", function (event) {
			console.log(event.global.x, event.global.y);

			drawing = true;
			last_point = { x: event.global.x, y: event.global.y };
			// graphics.moveTo(last_point.x, last_point.y);
			drawCircle(event.global.x, event.global.y);
		});

		// Mouse up event
		container.on("pointerup", function (event) {
			drawing = false;
			last_point = null;
		});

		// Mouse move event
		container.on("pointermove", function (event) {
			if (drawing && last_point) {
				let newPoint = { x: event.global.x, y: event.global.y };
				// 	graphics.lineStyle(20, 0x000000, 1, 0.5, false);
				// 	graphics.moveTo(last_point.x, last_point.y);
				// 	graphics.lineTo(newPoint.x, newPoint.y);
				interpolate(last_point, newPoint);
				last_point = newPoint;
			}
		});
	}

	function drawCircle(x, y): void {
		graphics.beginFill(brush_color);
		graphics.drawCircle(x, y, brush_size);
		graphics.endFill();
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
		}
	}

	async function add_bg() {
		const a = await PIXI.Assets.load(encodeURI(bg!));
		console.log(a);

		// if (resources["imageKey"].error) {
		// 	console.error(
		// 		"An error occurred while loading the image:",
		// 		resources["imageKey"].error
		// 	);
		// 	return;
		// }

		const sprite = new PIXI.Sprite(a);

		console.log("Sprite dimensions:", sprite.width, sprite.height);

		// if (sprite.width === 1 || sprite.height === 1) {
		// 	console.error(
		// 		"The sprite dimensions are not as expected. This might indicate the image did not load correctly."
		// 	);
		// 	return;
		// }

		const newWidth = sprite.width * ratio;
		const newHeight = sprite.height * ratio;
		console.log({ newWidth, newHeight });
		app.renderer.resize(sprite.width, sprite.height);
		app.view.style!.maxWidth = `${sprite.width}px`;
		app.view.style!.maxHeight = `${sprite.height}px`;
		sprite.zIndex = 1;
		container.addChild(sprite);

		// const sprite = PIXI.Sprite.from(encodeURI(bg!));
		// sprite.on("added", (e) => {
		// 	console.log("loaded");
		// 	sprite.anchor.set(0.5);
		// 	sprite.x = app.screen.width / 2;
		// 	sprite.y = app.screen.height / 2;
		// 	// Create a sprite from the loaded texture
		// 	const newWidth = sprite.width * ratio;
		// 	const newHeight = sprite.height * ratio;

		// 	app.renderer.resize(newWidth, sprite.height);

		// 	console.log(ratio, sprite.width, newHeight);
		// 	console.log({ newWidth, newHeight, sprite });

		// 	// Resize the canvas HTML element
		// 	app.view.style.width = `${sprite.width}px`;
		// 	app.view.style.height = `${sprite.height}px`;
		// });
		// container.addChild(sprite);

		// Add the sprite to the stage
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
