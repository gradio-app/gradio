<script>
	// @ts-nocheck

	import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
	import { fade } from "svelte/transition";
	import { LazyBrush } from "lazy-brush/src";
	import ResizeObserver from "resize-observer-polyfill";

	const dispatch = createEventDispatcher();

	export let value;
	export let value_img;
	export let mode = "sketch";
	export let brush_color = "#0b0f19";
	export let brush_radius = 50;
	export let source;

	export let width = 400;
	export let height = 200;
	export let container_height = 200;

	let mounted;

	let catenary_color = "#aaa";

	let canvas_width = width;
	let canvas_height = height;

	$: mounted && !value && clear();

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
			name: "drawing",
			zIndex: 11
		},
		{
			name: "temp",
			zIndex: 12
		},
		{
			name: "mask",
			zIndex: -1
		},
		{
			name: "temp_fake",
			zIndex: -2
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
	let chain_length = null;
	let canvas_container = null;
	let canvas_observer = null;
	let save_data = "";
	let line_count = 0;

	onMount(() => {
		Object.keys(canvas).forEach((key) => {
			ctx[key] = canvas[key].getContext("2d");
		});

		if (value_img) {
			value_img.addEventListener("load", (_) => {
				if (source === "webcam") {
					ctx.temp.save();
					ctx.temp.translate(width, 0);
					ctx.temp.scale(-1, 1);
					ctx.temp.drawImage(value_img, 0, 0);
					ctx.temp.restore();
				} else {
					ctx.temp.drawImage(value_img, 0, 0);
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
					ctx.temp.drawImage(value_img, 0, 0);
				}

				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

				draw_lines({ lines: lines.slice() });
				trigger_on_change();
			}, 100);
		}

		lazy = new LazyBrush({
			radius: brush_radius / 1.5,
			enabled: true,
			initialPoint: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2
			}
		});
		chain_length = brush_radius;

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
		lazy.update({ x: initX - chain_length / 3, y: initY }, { both: true });
		lazy.update({ x: initX + chain_length / 3, y: initY }, { both: false });
		mouse_has_moved = true;
		values_changed = true;
	}

	onDestroy(() => {
		mounted = false;
		canvas_observer.unobserve(canvas_container);
	});

	export function undo() {
		const _lines = lines.slice(0, -1);
		clear();

		if (value_img) {
			if (source === "webcam") {
				ctx.temp.save();
				ctx.temp.translate(width, 0);
				ctx.temp.scale(-1, 1);
				ctx.temp.drawImage(value_img, 0, 0);
				ctx.temp.restore();
			} else {
				ctx.temp.drawImage(value_img, 0, 0);
			}

			if (!lines || !lines.length) {
				ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);
			}
		}

		draw_lines({ lines: _lines });
		line_count = lines.length;

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
				brush_radius
			});

			if (mode === "mask") {
				draw_fake_points({
					points: _points,
					brush_color,
					brush_radius
				});
			}

			points = _points;
			saveLine({ brush_color, brush_radius });
			if (mode === "mask") {
				save_mask_line();
			}
			return;
		});
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
	let old_img = undefined;

	let handle_canvas_resize = async () => {
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
			set_canvas_size(canvas.temp_fake, dimensions, container_dimensions),
			set_canvas_size(canvas.mask, dimensions, container_dimensions, false)
		]);

		brush_radius = 20 * (dimensions.width / container_dimensions.width);

		loop({ once: true });

		setTimeout(() => {
			old_height = height;
			old_width = width;
			old_container_height = container_height;
		}, 100);
	};

	$: {
		if (lazy) {
			chain_length = brush_radius * 2;
			init();
			lazy.setRadius(brush_radius / 1.5);
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
				brush_radius
			});

			if (mode === "mask") {
				draw_fake_points({
					points: points,
					brush_color,
					brush_radius
				});
			}
		}
		mouse_has_moved = true;
	};

	let draw_points = ({ points, brush_color, brush_radius }) => {
		ctx.temp.lineJoin = "round";
		ctx.temp.lineCap = "round";

		ctx.temp.strokeStyle = brush_color;
		ctx.temp.lineWidth = brush_radius;
		if (!points || !points.length) return;
		let p1 = points[0];
		let p2 = points[1];
		ctx.temp.moveTo(p2.x, p2.y);
		ctx.temp.beginPath();
		for (var i = 1, len = points.length; i < len; i++) {
			var midPoint = mid_point(p1, p2);
			ctx.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points[i];
			p2 = points[i + 1];
		}

		ctx.temp.lineTo(p1.x, p1.y);
		ctx.temp.stroke();
	};

	let draw_fake_points = ({ points, brush_color, brush_radius }) => {
		ctx.temp_fake.lineJoin = "round";
		ctx.temp_fake.lineCap = "round";
		ctx.temp_fake.strokeStyle = "#fff";
		ctx.temp_fake.clearRect(0, 0, width, height);
		ctx.temp_fake.lineWidth = brush_radius;
		let p1 = points[0];
		let p2 = points[1];
		ctx.temp_fake.moveTo(p2.x, p2.y);
		ctx.temp_fake.beginPath();
		for (var i = 1, len = points.length; i < len; i++) {
			var midPoint = mid_point(p1, p2);
			ctx.temp_fake.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points[i];
			p2 = points[i + 1];
		}

		ctx.temp_fake.lineTo(p1.x, p1.y);
		ctx.temp_fake.stroke();
	};

	let save_mask_line = () => {
		lines.push({
			points: points.slice(),
			brush_color: "#fff",
			brush_radius
		});

		points.length = 0;

		ctx.mask.drawImage(canvas.temp_fake, 0, 0, width, height);

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
		values_changed = true;
		ctx.temp.clearRect(0, 0, width, height);

		ctx.temp.fillStyle = mode === "mask" ? "transparent" : "#FFFFFF";
		ctx.temp.fillRect(0, 0, width, height);

		if (mode === "mask") {
			ctx.temp_fake.clearRect(
				0,
				0,
				canvas.temp_fake.width,
				canvas.temp_fake.height
			);
			ctx.mask.clearRect(0, 0, width, height);
			ctx.mask.fillStyle = "#000";
			ctx.mask.fillRect(0, 0, width, height);
		}

		line_count = 0;

		return true;
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

	$: catenary_size = brush_radius * 0.15;
	$: brush_dot = brush_radius * 0.075;

	let draw_interface = (ctx, pointer, brush) => {
		ctx.clearRect(0, 0, width, height);

		// brush preview
		ctx.beginPath();
		ctx.fillStyle = brush_color;
		ctx.arc(brush.x, brush.y, brush_radius / 2, 0, Math.PI * 2, true);
		ctx.fill();

		// mouse point dangler
		ctx.beginPath();
		ctx.fillStyle = catenary_color;
		ctx.arc(pointer.x, pointer.y, catenary_size, 0, Math.PI * 2, true);
		ctx.fill();

		//  catenary
		if (lazy.isEnabled()) {
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.setLineDash([catenary_size, catenary_size * 2]);
			ctx.strokeStyle = catenary_color;
			ctx.stroke();
		}

		// tiny brush point dot
		ctx.beginPath();
		ctx.fillStyle = catenary_color;
		ctx.arc(brush.x, brush.y, brush_dot, 0, Math.PI * 2, true);
		ctx.fill();
	};

	export function get_image_data() {
		return mode === "mask"
			? canvas.mask.toDataURL("image/jpg")
			: canvas.drawing.toDataURL("image/jpg");
	}
</script>

<div
	class="touch-none relative h-full w-full"
	bind:this={canvas_container}
	bind:offsetWidth={canvas_width}
	bind:offsetHeight={canvas_height}
>
	{#if line_count === 0}
		<div
			transition:fade={{ duration: 50 }}
			class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none touch-none text-gray-400 md:text-xl"
		>
			Start drawing
		</div>
	{/if}
	{#each canvas_types as { name, zIndex }}
		<canvas
			key={name}
			class="inset-0 m-auto hover:cursor-none"
			style=" display:block;position:absolute; z-index:{zIndex};"
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
		/>
	{/each}
</div>
