<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Handle from "./Handle.svelte";
	import { type EditorContext } from "../ImageEditor.svelte";
	import { clamp } from "../utils/pixi";
	import { resize_and_reposition } from "./crop";

	export let editor_box: EditorContext["editor_box"];
	export let crop_constraint: number | null;

	const dispatch = createEventDispatcher<{
		crop_start: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
		crop_continue: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
		crop_end: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	}>();

	let _height = $editor_box.child_height;
	let _width = $editor_box.child_width;
	let _top = $editor_box.child_top - $editor_box.parent_top;
	let _left = $editor_box.child_left - $editor_box.parent_left;
	let _right = $editor_box.child_right - $editor_box.parent_left;
	let _bottom = 0;

	let dragging = false;

	export let w_p: number;
	export let h_p: number;
	export let l_p: number;
	export let t_p: number;

	const positions = ["tl", "br", "tr", "bl", "t", "b", "l", "r"] as const;

	let finished: boolean;

	let timer: NodeJS.Timeout;
	let triggered = false;

	$: {
		if (dragging || position_drag) {
			clearTimeout(timer);

			finished = false;
		} else {
			set_finished_with_timeout_and_delay();
		}
	}

	function set_finished_with_timeout_and_delay(): void {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			if (triggered) {
				dispatch("crop_end", {
					x: l_p,
					y: t_p,
					width: w_p,
					height: h_p
				});
				triggered = false;
			}

			finished = true;
			position_drag = false;
		}, 1000);
	}

	function handle_change(
		{
			top,
			bottom,
			left,
			right
		}: {
			top: number | undefined;
			bottom: number | undefined;
			left: number | undefined;
			right: number | undefined;
		},
		position: (typeof positions)[number]
	): void {
		_top = clamp(
			top ? top - $editor_box.parent_top : _top,
			$editor_box.child_top - $editor_box.parent_top,
			$editor_box.child_bottom - $editor_box.parent_top
		);

		_left = clamp(
			left ? left - $editor_box.parent_left : _left,
			$editor_box.child_left - $editor_box.parent_left,
			$editor_box.child_right - $editor_box.parent_left
		);
		_right = clamp(
			right ? right - $editor_box.parent_left : _right,
			$editor_box.child_left - $editor_box.parent_left,
			$editor_box.child_right - $editor_box.parent_left
		);
		_bottom = clamp(
			bottom ? bottom - $editor_box.parent_top : _bottom,
			$editor_box.child_top - $editor_box.parent_top,
			$editor_box.child_bottom - $editor_box.parent_top
		);
		_width = clamp(
			right ? right - _left - $editor_box.parent_left : _width,
			0,
			_right - _left
		);
		_width = clamp(
			left ? _right - left + $editor_box.parent_left : _width,
			0,
			_right - _left
		);
		_height = clamp(
			bottom ? bottom - _top - $editor_box.parent_top : _height,
			0,
			_bottom - _top
		);
		_height = clamp(
			top ? _bottom - top + $editor_box.parent_top : _height,
			0,
			_bottom - _top
		);

		const anchors_for_position = {
			tl: "br",
			tr: "bl",
			bl: "tr",
			br: "tl",
			t: "b",
			b: "t",
			l: "r",
			r: "l",
			c: "c"
		} as const;

		if (crop_constraint) {
			const max_w = ["t", "b"].includes(position)
				? $editor_box.child_width
				: _right - _left;
			const max_h = ["l", "r"].includes(position)
				? $editor_box.child_height
				: _bottom - _top;
			let result = resize_and_reposition(
				_width,
				_height,
				anchors_for_position[position],
				crop_constraint,
				max_w,
				max_h
			);

			_width = result.new_width;
			_height = result.new_height;
			_left = _left + result.x_offset;
			_top = _top + result.y_offset;
			_right = _left + _width;
			_bottom = _top + _height;
		}

		w_p = _width / $editor_box.child_width;
		h_p = _height / $editor_box.child_height;
		l_p =
			(_left - $editor_box.child_left + $editor_box.parent_left) /
			$editor_box.child_width;
		t_p =
			(_top - $editor_box.child_top + $editor_box.parent_top) /
			$editor_box.child_height;

		dispatch(triggered ? "crop_continue" : "crop_start", {
			x: l_p,
			y: t_p,
			width: w_p,
			height: h_p
		});

		triggered = true;
	}

	function resize(): void {
		_width = w_p * $editor_box.child_width;
		_height = h_p * $editor_box.child_height;
		_left =
			l_p * $editor_box.child_width +
			($editor_box.child_left - $editor_box.parent_left);
		_top =
			t_p * $editor_box.child_height +
			($editor_box.child_top - $editor_box.parent_top);
		_right = _left + _width;
		_bottom = _top + _height;
	}

	$: $editor_box && resize();

	let start_x = 0;
	let start_y = 0;
	let position_drag = false;
	function handle_drag_start(e: MouseEvent): void {
		position_drag = true;

		start_x = e.clientX;
		start_y = e.clientY;

		if (!finished) return;
		finished = false;
		dispatch("crop_start", {
			x: l_p,
			y: t_p,
			width: w_p,
			height: h_p
		});
	}

	function handle_drag_end(e: MouseEvent): void {
		if (!position_drag) return;

		position_drag = false;
	}

	function handle_dragging(e: MouseEvent): void {
		if (!position_drag) return;

		const x_delta = e.clientX - start_x;
		const y_delta = e.clientY - start_y;

		_left = clamp(
			_left + x_delta,
			$editor_box.child_left - $editor_box.parent_left,
			$editor_box.child_right - $editor_box.parent_left - _width
		);

		_top = clamp(
			_top + y_delta,
			$editor_box.child_top - $editor_box.parent_top,
			$editor_box.child_bottom - $editor_box.parent_top - _height
		);

		_right = _left + _width;
		_bottom = _top + _height;

		l_p =
			(_left - $editor_box.child_left + $editor_box.parent_left) /
			$editor_box.child_width;
		t_p =
			(_top - $editor_box.child_top + $editor_box.parent_top) /
			$editor_box.child_height;

		start_x = e.clientX;
		start_y = e.clientY;
		dispatch("crop_continue", {
			x: l_p,
			y: t_p,
			width: w_p,
			height: h_p
		});

		triggered = true;
	}
</script>

<svelte:window on:mousemove={handle_dragging} on:mouseup={handle_drag_end} />

<div class="wrap">
	<div
		class="box"
		style:width="{_width}px"
		style:height="{_height}px"
		style:top="{_top}px"
		style:left="{_left}px"
	>
		{#each positions as position}
			<Handle
				on:change={({ detail }) => handle_change(detail, position)}
				bind:dragging
				location={position}
			/>
		{/each}

		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="grid" class:finished on:mousedown={handle_drag_start}>
			{#each { length: 25 } as _}
				<div></div>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 1px 1fr 1px 1fr;
		grid-template-columns: 1fr 1px 1fr 1px 1fr;
		overflow: hidden;
		transition: 0.2s;
		opacity: 1;
		/* pointer-events: none; */
	}

	.grid.finished {
		opacity: 0;
	}

	.grid > div {
		width: 100%;
		height: 100%;
	}

	.grid > div:nth-of-type(even) {
		background: black;
		opacity: 0.5;
	}

	.wrap {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		/* transform: translateY(-20px); */
	}

	.box {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 1px solid black;
		z-index: var(--layer-top);
	}
</style>
