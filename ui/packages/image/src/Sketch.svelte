<script>
	import { onMount, onDestroy, createEventDispatcher } from "svelte";
	import { LazyBrush } from "lazy-brush/src";
	import ResizeObserver from "resize-observer-polyfill";

	const dispatch = createEventDispatcher();

	export let value;

	let mounted;

	let brush_radius = 50;
	let brush_color = "#444";
	let catenary_color = "#aaa";
	let background_color = "#FFF";

	let canvas_width = 400;
	let canvas_height = 400;

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
	let show_placeholder = false;
	let lazy = null;
	let chain_length = null;
	let canvas_container = null;
	let canvas_observer = null;
	let save_data = "";

	onMount(() => {
		Object.keys(canvas).forEach((key) => {
			ctx[key] = canvas[key].getContext("2d");
		});
		lazy = new LazyBrush({
			radius: brush_radius / 1.5,
			enabled: true,
			initialPoint: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2
			}
		});
		chain_length = brush_radius;
		canvas_observer = new ResizeObserver((entries, observer) =>
			handle_canvas_resize(entries, observer)
		);
		canvas_observer.observe(canvas_container);
		loop();
		mounted = true;
		window.setTimeout(() => {
			const initX = window.innerWidth / 2;
			const initY = window.innerHeight / 2;
			lazy.update({ x: initX - chain_length / 4, y: initY }, { both: true });
			lazy.update({ x: initX + chain_length / 4, y: initY }, { both: false });
			mouse_has_moved = true;
			values_changed = true;
			clear();

			if (save_data) {
				load_save_data(save_data);
			}
		}, 100);
	});

	onDestroy(() => {
		mounted = false;
		canvas_observer.unobserve(canvas_container);
	});

	export function undo() {
		const _lines = lines.slice(0, -1);
		clear();
		draw_lines({ lines: _lines });
		trigger_on_change();
	}

	let get_save_data = () => {
		return JSON.stringify({
			lines: lines,
			width: canvas_width,
			height: canvas_height
		});
	};

	let load_save_data = (save_data) => {
		if (typeof save_data !== "string") {
			throw new Error("save_data needs to be of type string!");
		}
		const { lines, width, height } = JSON.parse(save_data);
		if (!lines || typeof lines.push !== "function") {
			throw new Error("save_data.lines needs to be an array!");
		}
		clear();
		if (width === canvas_width && height === canvas_height) {
			draw_lines({
				lines
			});
		} else {
			const scaleX = canvas_width / width;
			const scaleY = canvas_height / height;
			draw_lines({
				lines: lines.map((line) => ({
					...line,
					points: line.points.map((p) => ({
						x: p.x * scaleX,
						y: p.y * scaleY
					})),
					brush_radius: line.brush_radius
				}))
			});
		}
	};

	let draw_lines = ({ lines }) => {
		lines.forEach((line) => {
			const { points: _points, brush_color, brush_radius } = line;

			draw_points({
				points: _points,
				brush_color,
				brush_radius
			});
			points = _points;
			saveLine({ brush_color, brush_radius });
			return;
		});
	};

	let handle_draw_start = (e) => {
		e.preventDefault();
		show_placeholder = true;
		is_pressing = true;
		const { x, y } = get_pointer_pos(e);
		if (e.touches && e.touches.length > 0) {
			lazy.update({ x, y }, { both: true });
		}
		handle_pointer_move(x, y);
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
	};

	let handle_canvas_resize = (entries) => {
		const save_data = get_save_data();
		for (const entry of entries) {
			const { width, height } = entry.contentRect;
			set_canvas_size(canvas.interface, width, height);
			set_canvas_size(canvas.drawing, width, height);
			set_canvas_size(canvas.temp, width, height);
			loop({ once: true });
		}
		load_save_data(save_data, true);
	};

	let set_canvas_size = (canvas, width, height) => {
		canvas.width = width * 3;
		canvas.height = height * 3;
		canvas.style.width = width;
		canvas.style.height = height;
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
			x: clientX - rect.left,
			y: clientY - rect.top
		};
	};

	let handle_pointer_move = (x, y) => {
		lazy.update({ x: x * 3, y: y * 3 });
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
		}
		mouse_has_moved = true;
	};

	let draw_points = ({ points, brush_color, brush_radius }) => {
		ctx.temp.lineJoin = "round";
		ctx.temp.lineCap = "round";
		ctx.temp.strokeStyle = brush_color;
		ctx.temp.clearRect(0, 0, ctx.temp.canvas.width, ctx.temp.canvas.height);
		ctx.temp.lineWidth = brush_radius;
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

	let saveLine = () => {
		if (points.length < 2) return;

		lines.push({
			points: [...points],
			brush_color: brush_color,
			brush_radius
		});
		points.length = 0;
		const width = canvas.temp.width;
		const height = canvas.temp.height;
		ctx.drawing.drawImage(canvas.temp, 0, 0, width, height);

		ctx.temp.clearRect(0, 0, width, height);
		trigger_on_change();
	};

	let trigger_on_change = () => {
		dispatch("change", get_image_data());
	};

	export function clear() {
		show_placeholder = false;
		lines = [];
		values_changed = true;
		ctx.drawing.clearRect(0, 0, canvas.drawing.width, canvas.drawing.height);
		ctx.temp.clearRect(0, 0, canvas.temp.width, canvas.temp.height);
		ctx.drawing.fillStyle = "#FFFFFF";
		ctx.drawing.fillRect(0, 0, canvas.drawing.width, canvas.drawing.height);
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

	let draw_interface = (ctx, pointer, brush) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// brush preview
		ctx.beginPath();
		ctx.fillStyle = brush_color;
		ctx.arc(brush.x, brush.y, brush_radius / 2, 0, Math.PI * 2, true);
		ctx.fill();

		// mouse point dangler
		ctx.beginPath();
		ctx.fillStyle = catenary_color;
		ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2, true);
		ctx.fill();

		//  catenary
		if (lazy.isEnabled()) {
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.setLineDash([2, 4]);
			ctx.strokeStyle = catenary_color;
			ctx.stroke();
		}

		// tiny brush point dot
		ctx.beginPath();
		ctx.fillStyle = catenary_color;
		ctx.arc(brush.x, brush.y, 2, 0, Math.PI * 2, true);
		ctx.fill();
	};

	export function get_image_data() {
		return canvas.drawing.toDataURL("image/png");
	}
</script>

<div
	class="touch-none relative"
	style="height:100%; width:100%; background-color:{background_color}"
	bind:this={canvas_container}
	bind:offsetWidth={canvas_width}
	bind:offsetHeight={canvas_height}
>
	{#if !show_placeholder}
		<div
			class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none touch-none text-gray-400 md:text-xl"
		>
			Start drawing
		</div>
	{/if}
	{#each canvas_types as { name, zIndex }}
		<canvas
			key={name}
			style="display:block;position:absolute; z-index:{zIndex}; width: {canvas_width}px; height: {canvas_height}px"
			bind:this={canvas[name]}
			on:mousedown={name === "interface" ? handle_draw_start : undefined}
			on:mousemove={name === "interface" ? handle_draw_move : undefined}
			on:mouseup={name === "interface" ? handle_draw_end : undefined}
			on:mouseout={name === "interface" ? handle_draw_end : undefined}
			on:touchstart={name === "interface" ? handle_draw_start : undefined}
			on:touchmove={name === "interface" ? handle_draw_move : undefined}
			on:touchend={name === "interface" ? handle_draw_end : undefined}
			on:touchcancel={name === "interface" ? handle_draw_end : undefined}
		/>
	{/each}
</div>
