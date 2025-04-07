<script lang="ts">
	import { spring } from "svelte/motion";
	import { Image } from "@gradio/icons";
	import { onMount, createEventDispatcher } from "svelte";

	const positions = [
		"top-left",
		"top",
		"top-right",
		"left",
		"center",
		"right",
		"bottom-left",
		"bottom",
		"bottom-right"
	] as const;
	const dispatch = createEventDispatcher<{
		position: (typeof positions)[number];
	}>();

	const spring_opt = {
		stiffness: 0.1,
		precision: 0.5
	};
	const pos = spring([5, 5], spring_opt);
	const init = [(120 - 10) / 3, (120 - 10) / 3];
	const dimensions = spring(init, spring_opt);
	type Arrow = {
		x: number;
		y: number;
		x_dir: number;
		y_dir: number;
		rotation: number;
		type: number;
	};
	const arrow_spring = spring<Arrow[]>([], spring_opt);

	let last_i = 0;
	let expanded = true;
	const box_size = (120 - 5 * 2) / 3;

	async function handle_box_hover(i: number): Promise<void> {
		expanded = false;
		last_i = i;
		const y = Math.floor(i / 3);
		const x = i % 3;
		pos.set([x * box_size + 5 * x + 5, y * box_size + 5 * y + 5]);

		dimensions.set(init);
	}

	let last_pos = 0;
	async function handle_box_click(i: number, stagger = false): Promise<void> {
		if (expanded && stagger) return;

		const y = Math.floor(i / 3);
		const x = i % 3;

		const [initial_arrows, eventual_arrows] = get_valid_offsets({
			x: x,
			y: y
		});

		if (stagger && last_i !== i) {
			await Promise.all([
				pos.set([x * box_size + 5 * x + 5, y * box_size + 5 * y + 5]),
				arrow_spring.set(initial_arrows, { hard: true }),
				dimensions.set(init)
			]);
		} else {
			await arrow_spring.set(initial_arrows, { hard: true });
		}
		last_pos = i;
		expanded = true;

		pos.set([0, 0]);
		dimensions.set([120 + 10, 120 + 10]);
		arrow_spring.set(eventual_arrows);

		dispatch("position", positions[i]);
	}

	function get_valid_offsets(anchorPoint: {
		x: number;
		y: number;
	}): [Arrow[], Arrow[]] {
		const destination_points: { x: number; y: number }[] = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 2, y: 0 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
			{ x: 0, y: 2 },
			{ x: 1, y: 2 },
			{ x: 2, y: 2 }
		];

		const offsets = destination_points
			.map((dest) => ({
				x: dest.x - anchorPoint.x,
				y: dest.y - anchorPoint.y,
				dest
			}))
			.filter((offset) => !(offset.x === 0 && offset.y === 0));

		const normalized_offsets = offsets
			.map((offset) => {
				// cardinal
				if (offset.x === 0 || offset.y === 0) {
					const magnitude = Math.max(Math.abs(offset.x), Math.abs(offset.y));
					return {
						magnitude,
						x: offset.x / magnitude,
						y: offset.y / magnitude,
						dest: offset.dest,
						original: offset,
						type: "cardinal" as const
					};
				}

				// ordinal
				if (Math.abs(offset.x) === Math.abs(offset.y)) {
					const magnitude = Math.abs(offset.x);
					return {
						magnitude,
						x: offset.x / magnitude,
						y: offset.y / magnitude,
						dest: offset.dest,
						original: offset,
						type: "ordinal" as const
					};
				}

				// skip the rest
				return null;
			})
			.filter((offset) => offset !== null);

		const directions = new Map<
			string,
			{
				x: number;
				y: number;
				dest: { x: number; y: number };
				original: { x: number; y: number };
				magnitude: number;
				type: "cardinal" | "ordinal";
			}[]
		>();

		normalized_offsets.forEach((offset) => {
			if (directions.has(`${offset.x}-${offset.y}`)) {
				directions.get(`${offset.x}-${offset.y}`)?.push(offset);
			} else {
				directions.set(`${offset.x}-${offset.y}`, [offset]);
			}
		});

		const unique_directions = Array.from(directions.values()).map(
			(direction) => {
				return direction.sort((a, b) => b.magnitude - a.magnitude)[0];
			}
		);

		const eventual_arrows = unique_directions.map((arrow) => ({
			x:
				arrow.dest.x * box_size +
				14 * arrow.dest.x +
				14 +
				10 +
				(arrow.type === "ordinal" ? 0 : 12 * arrow.x),
			y:
				arrow.dest.y * box_size +
				14 * arrow.dest.y +
				14 +
				10 +
				(arrow.type === "ordinal" ? 0 : 12 * arrow.y),
			x_dir: arrow.x,
			y_dir: arrow.y,
			rotation:
				Math.atan2(arrow.original.y, arrow.original.x) * (180 / Math.PI) + 180,
			type: arrow.type === "ordinal" ? 1 : 2
		}));

		const initial_arrows = eventual_arrows.map((arrow) => ({
			...arrow,
			x:
				anchorPoint.x * box_size +
				14 * anchorPoint.x + // gaps
				14 + // padding
				10 + // arrow head
				(arrow.x_dir * box_size) / 2 +
				arrow.x_dir * (arrow.type === 1 ? 0 : 10), // offset based on direction

			y:
				anchorPoint.y * box_size +
				14 * anchorPoint.y +
				14 +
				10 +
				(arrow.y_dir * box_size) / 2 +
				arrow.y_dir * (arrow.type === 1 ? 0 : 10)
		}));

		return [initial_arrows, eventual_arrows];
	}

	onMount(() => {
		handle_box_click(0);
	});
</script>

<div class="wrap" class:expanded>
	<div
		class="box-wrap"
		role="grid"
		tabindex="0"
		on:mouseleave={() => handle_box_click(last_pos, true)}
	>
		{#each { length: 9 } as _, i}
			<button
				class="box"
				class:active-box={last_pos === i}
				on:mouseenter={() => handle_box_hover(i)}
				on:click={() => handle_box_click(i)}
			>
				<span class:active={last_pos === i} class="icon-wrap">
					<Image />
				</span>
			</button>
		{/each}
	</div>
	<div
		class="expanding-box"
		style:width="{$dimensions[0]}px"
		style:height="{$dimensions[1]}px"
		style:transform="translate({$pos[0]}px, {$pos[1]}px)"
	></div>
	<svg viewBox="0 0 150 150">
		{#each $arrow_spring as arrow}
			<line
				x1={(last_pos % 3) * box_size +
					14 * (last_pos % 3) +
					14 +
					10 +
					(arrow.x_dir * box_size) / 2 +
					arrow.x_dir * (arrow.type === 1 ? 0 : 10)}
				x2={arrow.x}
				y1={Math.floor(last_pos / 3) * box_size +
					14 * Math.floor(last_pos / 3) +
					14 +
					10 +
					(arrow.y_dir * box_size) / 2 +
					arrow.y_dir * (arrow.type === 1 ? 0 : 10)}
				y2={arrow.y}
			/>
		{/each}
		{#each $arrow_spring as arrow}
			<g style:transform="translate(-75px, -75px)">
				<g style:transform="translate({arrow.x}px, {arrow.y}px)">
					<path
						d="M 70,75 80,69 80,81 Z"
						style:transform="rotate({arrow.rotation}deg)"
						style:transform-origin="75 75"
					/>
				</g>
			</g>
		{/each}
	</svg>
</div>

<style>
	.wrap {
		position: relative;
		margin: 10px 0;
		height: 130px;
		width: 130px;
		padding: 5px;
	}

	.box-wrap {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
		gap: 5px;

		background-color: var(--block-background-fill);
	}

	.box {
		cursor: pointer;
		border: none;
		border: #ccc dashed 1px;
		border-radius: 4px;
		transition: 0.1s;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.box::after {
		background: none !important;
	}

	.expanding-box {
		--mod: 3;
		--border: 2;
		border: orange solid 2px;
		border-radius: 4px;
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
		pointer-events: none;

		width: calc(100% / var(--mod));
		height: calc(100% / var(--mod));
		transform-origin: 50% 0;
		box-sizing: border-box;
	}

	svg {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;

		pointer-events: none;
	}

	.icon-wrap {
		opacity: 0.2;
		height: 50%;
		width: 50%;

		display: flex;
		justify-content: center;
		align-items: center;
		border-color: #ccc;
		transition: 0.1s;
		padding-top: 1px;
	}

	.wrap.expanded .icon-wrap {
		opacity: 0;
	}

	.wrap.expanded .box {
		border-color: #fff;
	}

	.icon-wrap.active {
		opacity: 1 !important;
	}

	svg {
		opacity: 0;
		padding: 5px;
		transition: 0.1s;
	}
	.expanded svg {
		opacity: 1;
	}

	svg line {
		stroke: #999;
		stroke-width: 3px;
		stroke-linecap: round;
	}

	svg path {
		stroke-width: 3;
		stroke: #999;
		stroke-linejoin: round;
		stroke-linecap: round;
		fill: #999;
		/* transition: 0.5s; */
		transform-origin: 75px 75px;
	}
</style>
