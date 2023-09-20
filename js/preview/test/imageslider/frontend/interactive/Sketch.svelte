<script>
	// @ts-nocheck
	/* eslint-disable */

	import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
	import { fade } from "svelte/transition";
	import { LazyBrush } from "lazy-brush/src";
	import ResizeObserver from "resize-observer-polyfill";

	const dispatch = createEventDispatcher();

	export let value;
	export let value_img;
	export let mode = "sketch";
	export let brush_color = "#0b0f19";
	export let brush_radius;
	export let mask_opacity = 0.7;
	export let source;

	export let width = 400;
	export let height = 200;
	export let container_height = 200;
	export let shape;

	$: {
		if (shape && (width || height)) {
			width = shape[0];
			height = shape[1];
		}
	}

	let mounted;

	let catenary_color = "#aaa";

	let canvas_width = width;
	let canvas_height = height;

	$: mounted && !value && clear();

	let last_value_img;

	$: {
		if (mounted && value_img !== last_value_img) {
			last_value_img = value_img;

			clear();

			setTimeout(() => {
				if (source === "webcam") {
					ctx.temp.save();
					ctx.temp.translate(width, 0);
					ctx.temp.scale(-1, 1);
					ctx.temp.drawImage(value_img, 0, 0);
					ctx.temp.restore();
				} else {
					draw_cropped_image();
				}

				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

				draw_lines({ lines: lines.slice() });
				trigger_on_change();
			}, 50);
		}
	}

	function mid_point(p1, p2) {
		return {
			x: p1.x + (p2.x - p1.x) / 2,
			y: p1.y + (p2.y - p1.y) / 2
		};
	}

	const canvas_types = [
		{
			name: "interface",
			zIndex: 15
		},
		{
			name: "mask",
			zIndex: 13,
			opacity: mask_opacity
		},
		{
			name: "drawing",
			zIndex: 11
		},
		{
			name: "temp",
			zIndex: 12
		}
	];

	let canvas = {};
	let ctx = {};
	let points = [];
	let lines = [];
	let mouse_has_moved = true;
	let values_changed = true;
	let is_drawing = false;
	let is_pressing = false;
	let lazy = null;
	let canvas_container = null;
	let canvas_observer = null;
	let line_count = 0;

	function draw_cropped_image() {
		if (!shape) {
			ctx.temp.drawImage(value_img, 0, 0, width, height);
			return;
		}

		let _width = value_img.naturalWidth;
		let _height = value_img.naturalHeight;

		const shape_ratio = shape[0] / shape[1];
		const image_ratio = _width / _height;

		let x = 0;
		let y = 0;

		if (shape_ratio < image_ratio) {
			_width = shape[1] * image_ratio;
			_height = shape[1];
			x = (shape[0] - _width) / 2;
		} else if (shape_ratio > image_ratio) {
			_width = shape[0];
			_height = shape[0] / image_ratio;
			y = (shape[1] - _height) / 2;
		} else {
			x = 0;
			y = 0;
			_width = shape[0];
			_height = shape[1];
		}

		ctx.temp.drawImage(value_img, x, y, _width, _height);
	}

	onMount(async () => {
		Object.keys(canvas).forEach((key) => {
			ctx[key] = canvas[key].getContext("2d");
		});

		await tick();

		if (value_img) {
			value_img.addEventListener("load", (_) => {
				if (source === "webcam") {
					ctx.temp.save();
					ctx.temp.translate(width, 0);
					ctx.temp.scale(-1, 1);
					ctx.temp.drawImage(value_img, 0, 0);
					ctx.temp.restore();
				} else {
					draw_cropped_image();
				}
				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

				trigger_on_change();
			});

			setTimeout(() => {
				if (source === "webcam") {
					ctx.temp.save();
					ctx.temp.translate(width, 0);
					ctx.temp.scale(-1, 1);
					ctx.temp.drawImage(value_img, 0, 0);
					ctx.temp.restore();
				} else {
					draw_cropped_image();
				}

				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

				draw_lines({ lines: lines.slice() });
				trigger_on_change();
			}, 100);
		}

		lazy = new LazyBrush({
			radius: brush_radius * 0.05,
			enabled: true,
			initialPoint: {
				x: width / 2,
				y: height / 2
			}
		});

		canvas_observer = new ResizeObserver((entries, observer, ...rest) => {
			handle_canvas_resize(entries, observer);
		});
		canvas_observer.observe(canvas_container);

		loop();
		mounted = true;

		requestAnimationFrame(() => {
			init();
			requestAnimationFrame(() => {
				clear();
			});
		});
	});

	function init() {
		const initX = width / 2;
		const initY = height / 2;
		lazy.update({ x: initX, y: initY }, { both: true });
		lazy.update({ x: initX, y: initY }, { both: false });
		mouse_has_moved = true;
		values_changed = true;
	}

	onDestroy(() => {
		mounted = false;
		canvas_observer.unobserve(canvas_container);
	});

	function redraw_image(_lines) {
		clear_canvas();

		if (value_img) {
			if (source === "webcam") {
				ctx.temp.save();
				ctx.temp.translate(width, 0);
				ctx.temp.scale(-1, 1);
				ctx.temp.drawImage(value_img, 0, 0);
				ctx.temp.restore();
			} else {
				draw_cropped_image();
			}

			if (!lines || !lines.length) {
				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);
			}
		}

		draw_lines({ lines: _lines });
		line_count = _lines.length;

		lines = _lines;
		ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

		if (lines.length == 0) {
			dispatch("clear");
		}
	}

	export function clear_mask() {
		const _lines = [];

		redraw_image(_lines);
		trigger_on_change();
	}

	export function undo() {
		const _lines = lines.slice(0, -1);

		redraw_image(_lines);
		trigger_on_change();
	}

	let get_save_data = () => {
		return JSON.stringify({
			lines: lines,
			width: canvas_width,
			height: canvas_height
		});
	};

	let draw_lines = ({ lines }) => {
		lines.forEach((line) => {
			const { points: _points, brush_color, brush_radius } = line;
			draw_points({
				points: _points,
				brush_color,
				brush_radius,
				mask: mode === "mask"
			});
		});

		saveLine({ brush_color, brush_radius });
		if (mode === "mask") {
			save_mask_line();
		}
	};

	let handle_draw_start = (e) => {
		e.preventDefault();
		is_pressing = true;
		const { x, y } = get_pointer_pos(e);
		if (e.touches && e.touches.length > 0) {
			lazy.update({ x, y }, { both: true });
		}
		handle_pointer_move(x, y);
		line_count += 1;
	};

	let handle_draw_move = (e) => {
		e.preventDefault();
		const { x, y } = get_pointer_pos(e);
		handle_pointer_move(x, y);
	};

	let handle_draw_end = (e) => {
		e.preventDefault();
		handle_draw_move(e);
		is_drawing = false;
		is_pressing = false;
		saveLine();

		if (mode === "mask") {
			save_mask_line();
		}
	};

	let old_width = 0;
	let old_height = 0;
	let old_container_height = 0;
	let add_lr_border = false;

	let handle_canvas_resize = async () => {
		if (shape && canvas_container) {
			const x = canvas_container?.getBoundingClientRect();
			const shape_ratio = shape[0] / shape[1];
			const container_ratio = x.width / x.height;
			add_lr_border = shape_ratio < container_ratio;
		}

		if (
			width === old_width &&
			height === old_height &&
			old_container_height === container_height
		) {
			return;
		}
		const dimensions = { width: width, height: height };

		const container_dimensions = {
			height: container_height,
			width: container_height * (dimensions.width / dimensions.height)
		};

		await Promise.all([
			set_canvas_size(canvas.interface, dimensions, container_dimensions),
			set_canvas_size(canvas.drawing, dimensions, container_dimensions),
			set_canvas_size(canvas.temp, dimensions, container_dimensions),
			set_canvas_size(canvas.mask, dimensions, container_dimensions, false)
		]);

		if (!brush_radius) {
			brush_radius = 20 * (dimensions.width / container_dimensions.width);
		}

		loop({ once: true });

		setTimeout(() => {
			old_height = height;
			old_width = width;
			old_container_height = container_height;
		}, 10);
		await tick();

		clear();
	};

	$: {
		if (lazy) {
			init();
			lazy.setRadius(brush_radius * 0.05);
		}
	}

	$: {
		if (width || height) {
			handle_canvas_resize();
		}
	}

	let set_canvas_size = async (canvas, dimensions, container, scale = true) => {
		if (!mounted) return;
		await tick();

		const dpr = window.devicePixelRatio || 1;
		canvas.width = dimensions.width * (scale ? dpr : 1);
		canvas.height = dimensions.height * (scale ? dpr : 1);

		const ctx = canvas.getContext("2d");
		scale && ctx.scale(dpr, dpr);

		canvas.style.width = `${container.width}px`;
		canvas.style.height = `${container.height}px`;
	};

	let get_pointer_pos = (e) => {
		const rect = canvas.interface.getBoundingClientRect();

		let clientX = e.clientX;
		let clientY = e.clientY;
		if (e.changedTouches && e.changedTouches.length > 0) {
			clientX = e.changedTouches[0].clientX;
			clientY = e.changedTouches[0].clientY;
		}

		return {
			x: ((clientX - rect.left) / rect.width) * width,
			y: ((clientY - rect.top) / rect.height) * height
		};
	};

	let handle_pointer_move = (x, y) => {
		lazy.update({ x: x, y: y });
		const is_disabled = !lazy.isEnabled();
		if ((is_pressing && !is_drawing) || (is_disabled && is_pressing)) {
			is_drawing = true;
			points.push(lazy.brush.toObject());
		}
		if (is_drawing) {
			points.push(lazy.brush.toObject());
			draw_points({
				points: points,
				brush_color,
				brush_radius,
				mask: mode === "mask"
			});
		}
		mouse_has_moved = true;
	};

	let draw_points = ({ points, brush_color, brush_radius, mask }) => {
		if (!points || points.length < 2) return;
		let target_ctx = mask ? ctx.mask : ctx.temp;
		target_ctx.lineJoin = "round";
		target_ctx.lineCap = "round";

		target_ctx.strokeStyle = brush_color;
		target_ctx.lineWidth = brush_radius;
		let p1 = points[0];
		let p2 = points[1];
		target_ctx.moveTo(p2.x, p2.y);
		target_ctx.beginPath();
		for (var i = 1, len = points.length; i < len; i++) {
			var midPoint = mid_point(p1, p2);
			target_ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points[i];
			p2 = points[i + 1];
		}

		target_ctx.lineTo(p1.x, p1.y);
		target_ctx.stroke();
	};

	let save_mask_line = () => {
		if (points.length < 1) return;
		points.length = 0;

		trigger_on_change();
	};

	let saveLine = () => {
		if (points.length < 1) return;

		lines.push({
			points: points.slice(),
			brush_color: brush_color,
			brush_radius
		});

		if (mode !== "mask") {
			points.length = 0;
		}

		ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

		trigger_on_change();
	};

	let trigger_on_change = () => {
		const x = get_image_data();
		dispatch("change", x);
	};

	export function clear() {
		lines = [];
		clear_canvas();
		line_count = 0;

		return true;
	}

	function clear_canvas() {
		values_changed = true;
		ctx.temp.clearRect(0, 0, width, height);

		ctx.temp.fillStyle = mode === "mask" ? "transparent" : "#FFFFFF";
		ctx.temp.fillRect(0, 0, width, height);

		if (mode === "mask") {
			ctx.mask.clearRect(0, 0, canvas.mask.width, canvas.mask.height);
		}
	}

	let loop = ({ once = false } = {}) => {
		if (mouse_has_moved || values_changed) {
			const pointer = lazy.getPointerCoordinates();
			const brush = lazy.getBrushCoordinates();
			draw_interface(ctx.interface, pointer, brush);
			mouse_has_moved = false;
			values_changed = false;
		}
		if (!once) {
			window.requestAnimationFrame(() => {
				loop();
			});
		}
	};

	$: brush_dot = brush_radius * 0.075;

	let draw_interface = (ctx, pointer, brush) => {
		ctx.clearRect(0, 0, width, height);

		// brush preview
		ctx.beginPath();
		ctx.fillStyle = brush_color;
		ctx.arc(brush.x, brush.y, brush_radius / 2, 0, Math.PI * 2, true);
		ctx.fill();

		// tiny brush point dot
		ctx.beginPath();
		ctx.fillStyle = catenary_color;
		ctx.arc(brush.x, brush.y, brush_dot, 0, Math.PI * 2, true);
		ctx.fill();
	};

	export function get_image_data() {
		return mode === "mask"
			? canvas.mask.toDataURL("image/png")
			: canvas.drawing.toDataURL("image/jpg");
	}
</script>

<div
	class="wrap"
	bind:this={canvas_container}
	bind:offsetWidth={canvas_width}
	bind:offsetHeight={canvas_height}
>
	{#if line_count === 0}
		<div transition:fade={{ duration: 50 }} class="start-prompt">
			Start drawing
		</div>
	{/if}
	{#each canvas_types as { name, zIndex, opacity }}
		<canvas
			key={name}
			style=" z-index:{zIndex};"
			style:opacity
			class:lr={add_lr_border}
			class:tb={!add_lr_border}
			bind:this={canvas[name]}
			on:mousedown={name === "interface" ? handle_draw_start : undefined}
			on:mousemove={name === "interface" ? handle_draw_move : undefined}
			on:mouseup={name === "interface" ? handle_draw_end : undefined}
			on:mouseout={name === "interface" ? handle_draw_end : undefined}
			on:blur={name === "interface" ? handle_draw_end : undefined}
			on:touchstart={name === "interface" ? handle_draw_start : undefined}
			on:touchmove={name === "interface" ? handle_draw_move : undefined}
			on:touchend={name === "interface" ? handle_draw_end : undefined}
			on:touchcancel={name === "interface" ? handle_draw_end : undefined}
			on:click|stopPropagation
		/>
	{/each}
</div>

<style>
	canvas {
		display: block;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		margin: auto;
	}

	.lr {
		border-right: 1px solid var(--border-color-primary);
		border-left: 1px solid var(--border-color-primary);
	}

	.tb {
		border-top: 1px solid var(--border-color-primary);
		border-bottom: 1px solid var(--border-color-primary);
	}

	canvas:hover {
		cursor: none;
	}

	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		touch-action: none;
	}

	.start-prompt {
		display: flex;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		justify-content: center;
		align-items: center;
		z-index: var(--layer-4);
		touch-action: none;
		pointer-events: none;
		color: var(--body-text-color-subdued);
	}
</style>
