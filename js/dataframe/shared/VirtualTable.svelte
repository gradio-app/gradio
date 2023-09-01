<script lang="ts">
	import { afterUpdate, onMount, tick } from "svelte";
	import { _ } from "svelte-i18n";

	export let items: any[][] = [];

	export let table_width: number;
	export let max_height: number;
	export let actual_height: number;
	export let start = 0;
	export let end = 0;
	export let viewport: HTMLTableElement;
	export let selected: number | boolean = false;

	let height = "100%";

	let average_height: number;
	let bottom = 0;
	let contents: HTMLTableSectionElement;
	let head_height = 0;
	let foot_height = 0;
	let height_map: number[] = [];
	let mounted: boolean;
	let rows: HTMLCollectionOf<HTMLTableRowElement>;
	let top = 0;

	let viewport_height = 0;
	let visible: { index: number; data: any[] }[] = [];

	let old_items = "";
	$: {
		console.log("updating");

		if (mounted)
			requestAnimationFrame(() => {
				if (JSON.stringify(items) !== old_items) {
					console.log("updating");
					old_items = JSON.stringify(items);
					refresh_height_map(sortedItems, viewport_height);
				}
			});
	}

	let content_height = 0;
	async function refresh_height_map(
		_items: typeof items,
		viewport_height: number
	): Promise<void> {
		await tick();
		if (viewport_height === 0 || table_width === 0) {
			return;
		}
		const { scrollTop } = viewport;

		await tick();
		content_height = top - (scrollTop - head_height);
		let i = start;

		while (content_height < max_height && i < _items.length) {
			let row = rows[i - start];
			if (!row) {
				end = i + 1;
				await tick(); // render the newly visible row
				row = rows[i - start];
			}
			const row_height = (height_map[i] = row.getBoundingClientRect().height);
			content_height += row_height;
			i += 1;
		}

		end = i;
		const remaining = _items.length - end;

		average_height = (top + (content_height - head_height)) / end;

		bottom = remaining * average_height;
		console.log(average_height);
		height_map.length = _items.length;
		if (!max_height) {
			actual_height = content_height;
		} else if (content_height < max_height) {
			actual_height = content_height;
		} else {
			actual_height = max_height;
		}

		await tick();
		if (typeof selected !== "number") {
			scroll_to_index(start, { behavior: "auto" });
		}
	}

	let last_selected = selected;

	// $: selected !== false && scroll_to_index(selected, { behavior: "instant" });
	afterUpdate(() => {
		if (typeof selected === "number" && selected !== last_selected) {
			scroll_to_index(selected, { behavior: "instant" });
			last_selected = selected;
		}
	});

	let programmatic_scroll = false;
	// async function handle_scroll(): Promise<void> {
	// 	if (programmatic_scroll || !mounted) {
	// 		return;
	// 	}
	// 	console.log("SCROLLING");
	// 	// selected = false;
	// 	const { scrollTop } = viewport;

	// 	rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
	// 	const is_start_overflow = sortedItems.length < start;

	// 	if (is_start_overflow) {
	// 		await scroll_to_index(sortedItems.length - 1, { behavior: "auto" });
	// 	}

	// 	let new_start = 0;
	// 	// acquire height map for currently visible rows
	// 	for (let v = 0; v < rows.length; v += 1) {
	// 		height_map[start + v] = rows[v].getBoundingClientRect().height;
	// 	}
	// 	let i = 0;
	// 	// start from top: thead, with its borders, plus the first border to afterwards neglect
	// 	let y = head_height;

	// 	let row_heights = [];
	// 	// loop items to find new start
	// 	while (i < sortedItems.length) {
	// 		const row_height = height_map[i] || average_height;
	// 		row_heights[i] = row_height;
	// 		// we only want to jump if the full (incl. border) row is away
	// 		if (y + row_height > scrollTop) {
	// 			// this is the last index still inside the viewport
	// 			new_start = i;
	// 			top = y - head_height;
	// 			break;
	// 		}
	// 		y += row_height;
	// 		i += 1;
	// 	}

	// 	new_start = Math.max(0, new_start);
	// 	while (i < sortedItems.length) {
	// 		const row_height = height_map[i] || average_height;
	// 		// console.log({ y, row_height, average_height, i });

	// 		y += row_height;
	// 		i += 1;
	// 		if (y > scrollTop + viewport_height) {
	// 			break;
	// 		}
	// 	}
	// 	start = new_start;
	// 	end = i;
	// 	const remaining = sortedItems.length - end;
	// 	if (end === 0) {
	// 		end = 10;
	// 	}
	// 	average_height = (y - head_height) / end;

	// 	let remaining_height = remaining * average_height; // 0
	// 	// compute height map for remaining items
	// 	while (i < sortedItems.length) {
	// 		i += 1;
	// 		height_map[i] = average_height;
	// 	}

	// 	// console.log({ average_height });
	// 	bottom = remaining_height + foot_height;
	// 	// if (!isFinite(bottom)) {
	// 	// 	bottom = 200000;
	// 	// }
	// }

	async function handle_scroll(e: Event): void {
		const { scrollTop } = viewport;

		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		const is_start_overflow = sortedItems.length < start;

		// if (is_start_overflow) {
		// 	await scroll_to_index(sortedItems.length - 1, { behavior: "auto" });
		// }

		let new_start = 0;
		// acquire height map for currently visible rows
		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = rows[v].getBoundingClientRect().height;
		}
		let i = 0;
		// start from top: thead, with its borders, plus the first border to afterwards neglect
		let y = head_height;
		let row_heights = [];
		// loop items to find new start
		// console.log({ y });
		let _top = 0;
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			row_heights[i] = row_height;
			// we only want to jump if the full (incl. border) row is away
			// console.log({ y, row_height, scrollTop });

			if (y + row_height > scrollTop) {
				// this is the last index still inside the viewport
				new_start = i;
				_top = y - head_height;
				break;
			}
			y += row_height;
			i += 1;
		}

		new_start = Math.max(0, new_start);
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			y += row_height;
			i += 1;
			if (y > scrollTop + max_height) {
				break;
			}
		}
		start = new_start;
		end = i;
		const remaining = sortedItems.length - end;
		if (end === 0) {
			end = 10;
		}
		average_height = (y - head_height) / end;
		let remaining_height = remaining * average_height; // 0
		// compute height map for remaining items
		while (i < sortedItems.length) {
			i += 1;
			height_map[i] = average_height;
		}
		console.log({ bottom, top, start, end });

		if (!isFinite(bottom)) {
			bottom = 200000;
		}

		await tick();
		bottom = remaining_height;
		top = _top;
	}

	function get_first_visible_element(
		start: number,
		direction: 1 | -1,
		box: DOMRect,
		scroll_top: number
	): number {
		let first_fully_visible_row = -1;
		let row = start;
		const { top, bottom } = box;
		while (first_fully_visible_row < 0) {
			if (row > rows.length - 1 || row < 0) {
				break;
			}
			// console.log(rows, row);
			const current = rows[row]?.getBoundingClientRect();
			// console.log({ current, bottom, scroll_top });
			if (direction === 1) {
				if (current && current.top - head_height >= top) {
					first_fully_visible_row = row;
				}
				row += 1;
			} else {
				if (current && current.bottom < bottom) {
					first_fully_visible_row = row;
				}
				row -= 1;
			}
		}
		return first_fully_visible_row;
	}
	// $: console.log($$props);
	$: console.log({ top, bottom });
	export async function scroll_to_index(
		index: number,
		opts: ScrollToOptions
	): Promise<void> {
		console.log("scrolling to index");
		console.log({ index, opts });
		// selected = false;
		if (!rows.length) return;
		await tick();
		function get_row_position(_row: number): "above" | "below" | "in_view" {
			const viewport_box = viewport.getBoundingClientRect();
			const { scrollTop } = viewport;
			const visible_bounds = [
				get_first_visible_element(0, 1, viewport_box, scrollTop),
				get_first_visible_element(rows.length - 1, -1, viewport_box, scrollTop)
			];

			if (index < visible_bounds[0] + start) {
				return "above";
			}
			if (index > visible_bounds[1] + start) {
				return "below";
			}
			return "in_view";
		}

		const row_position = get_row_position(index);

		if (row_position === "in_view") {
			return;
		}

		let position = 0;
		if (row_position === "above") {
			position = index * average_height;
		}

		if (row_position === "below") {
			position =
				index * average_height -
				viewport_height +
				foot_height +
				head_height +
				average_height;
		}

		console.log({ position });
		// viewport.scrollTo({ top: scroll_to_position, ...opts });
		// programmatic_scroll = true;
		await scroll_to_position(viewport, { top: position, ...opts });
		await tick();
		// programmatic_scroll = false;
		// selected = false;
		// await scroll_to_position(viewport, { top: position, ...opts });
	}

	async function scroll_to_position(
		container: HTMLElement,
		opts: ScrollToOptions
	): Promise<unknown> {
		const position = Math.round(opts.top!);
		console.log("starting", { opts }, container.scrollTop, position);
		if (container.scrollTop === position) {
			return;
		}

		console.log(container.clientHeight);

		container.scrollTo(opts);

		// return promise;
	}

	$: sortedItems = items;

	$: visible = sortedItems.slice(start, end).map((data, i) => {
		// console.log(data);
		return { index: i + start, data };
	});

	const throttle_scroll = handle_scroll;

	function throttle(fn: () => void, wait: number): () => void {
		let time = Date.now();
		return function () {
			if (time + wait - Date.now() < 0) {
				fn();
				time = Date.now();
			}
		};
	}

	onMount(() => {
		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		mounted = true;
		refresh_height_map(items, viewport_height);
	});
</script>

<svelte-virtual-table-viewport>
	<table
		class="table"
		bind:this={viewport}
		bind:offsetHeight={viewport_height}
		on:scroll={throttle_scroll}
		style="height: {height}; --bw-svt-p-top: {top}px; --bw-svt-p-bottom: {bottom}px; --bw-svt-head-height: {head_height}px; --bw-svt-foot-height: {foot_height}px; --bw-svt-avg-row-height: {average_height}px"
	>
		<thead class="thead" bind:offsetHeight={head_height}>
			<slot name="thead" />
		</thead>
		<tbody bind:this={contents} class="tbody">
			{#each visible as item (item.data[0].id)}
				<slot name="tbody" item={item.data} index={item.index}>
					Missing Table Row
				</slot>
			{/each}
		</tbody>
		<tfoot class="tfoot" bind:offsetHeight={foot_height}>
			<slot name="tfoot" />
		</tfoot>
	</table>
</svelte-virtual-table-viewport>

<style type="text/css">
	table {
		position: relative;
		overflow-y: scroll;
		overflow-x: scroll;
		-webkit-overflow-scrolling: touch;
		max-height: 100vh;
		box-sizing: border-box;
		display: block;
		padding: 0;
		margin: 0;
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-md);
		font-family: var(--font-mono);
		border-spacing: 0;
		width: 100%;
		scroll-snap-type: x proximity;
	}
	table :is(thead, tfoot, tbody) {
		display: table;
		table-layout: fixed;
		width: 100%;
		box-sizing: border-box;
	}

	tbody {
		overflow-x: scroll;
		overflow-y: hidden;
	}

	table tbody {
		padding-top: var(--bw-svt-p-top);
		padding-bottom: var(--bw-svt-p-bottom);
	}
	tbody {
		position: relative;
		box-sizing: border-box;
		border: 0px solid currentColor;
	}

	tbody > :global(tr:last-child) {
		border: none;
	}

	table :global(td) {
		scroll-snap-align: start;
	}

	tbody > :global(tr:nth-child(even)) {
		background: var(--table-even-background-fill);
	}

	thead {
		position: sticky;
		top: 0;
		left: 0;
		z-index: var(--layer-1);
		box-shadow: var(--shadow-drop);
	}
</style>
