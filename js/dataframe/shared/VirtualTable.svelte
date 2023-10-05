<script lang="ts">
	import { onMount, tick } from "svelte";
	import { _ } from "svelte-i18n";

	export let items: any[][] = [];

	export let table_width: number;
	export let max_height: number;
	export let actual_height: number;
	export let table_scrollbar_width: number;
	export let start = 0;
	export let end = 0;
	export let selected: number | false;
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
	let viewport: HTMLTableElement;
	let viewport_height = 0;
	let visible: { index: number; data: any[] }[] = [];

	$: if (mounted) requestAnimationFrame(() => refresh_height_map(sortedItems));

	let content_height = 0;
	async function refresh_height_map(_items: typeof items): Promise<void> {
		if (viewport_height === 0 || table_width === 0) {
			return;
		}
		const { scrollTop } = viewport;
		table_scrollbar_width = viewport.offsetWidth - viewport.clientWidth;

		content_height = top - (scrollTop - head_height);
		let i = start;

		while (content_height < max_height && i < _items.length) {
			let row = rows[i - start];
			if (!row) {
				end = i + 1;
				await tick(); // render the newly visible row
				row = rows[i - start];
			}
			let _h = row?.getBoundingClientRect().height;
			if (!_h) {
				_h = average_height;
			}
			const row_height = (height_map[i] = _h);
			content_height += row_height;
			i += 1;
		}

		end = i;
		const remaining = _items.length - end;

		const scrollbar_height = viewport.offsetHeight - viewport.clientHeight;
		if (scrollbar_height > 0) {
			content_height += scrollbar_height;
		}

		let filtered_height_map = height_map.filter((v) => typeof v === "number");
		average_height =
			filtered_height_map.reduce((a, b) => a + b, 0) /
			filtered_height_map.length;

		bottom = remaining * average_height;
		height_map.length = _items.length;
		await tick();
		if (!max_height) {
			actual_height = content_height + 1;
		} else if (content_height < max_height) {
			actual_height = content_height + 2;
		} else {
			actual_height = max_height;
		}

		await tick();
	}

	$: scroll_and_render(selected);
	async function scroll_and_render(n: number | false): Promise<void> {
		requestAnimationFrame(async () => {
			if (typeof n !== "number") return;
			const direction = typeof n !== "number" ? false : is_in_view(n);
			if (direction === true) {
				return;
			}
			if (direction === "back") {
				await scroll_to_index(n, { behavior: "instant" });
			}

			if (direction === "forwards") {
				await scroll_to_index(n, { behavior: "instant" }, true);
			}
		});
	}

	function is_in_view(n: number): "back" | "forwards" | true {
		const current = rows && rows[n - start];
		if (!current && n < start) {
			return "back";
		}
		if (!current && n >= end - 1) {
			return "forwards";
		}

		const { top: viewport_top } = viewport.getBoundingClientRect();
		const { top, bottom } = current.getBoundingClientRect();

		if (top - viewport_top < 37) {
			return "back";
		}

		if (bottom - viewport_top > viewport_height) {
			return "forwards";
		}

		return true;
	}

	function get_computed_px_amount(elem: HTMLElement, property: string): number {
		if (!elem) {
			return 0;
		}
		const compStyle = getComputedStyle(elem);

		let x = parseInt(compStyle.getPropertyValue(property));
		return x;
	}

	async function handle_scroll(e: Event): Promise<void> {
		const scroll_top = viewport.scrollTop;

		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		const is_start_overflow = sortedItems.length < start;

		const row_top_border = get_computed_px_amount(rows[1], "border-top-width");

		const actual_border_collapsed_width = 0;

		if (is_start_overflow) {
			await scroll_to_index(sortedItems.length - 1, { behavior: "auto" });
		}

		let new_start = 0;
		// acquire height map for currently visible rows
		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = rows[v].getBoundingClientRect().height;
		}
		let i = 0;
		// start from top: thead, with its borders, plus the first border to afterwards neglect
		let y = head_height + row_top_border / 2;
		let row_heights = [];
		// loop items to find new start
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			row_heights[i] = row_height;
			// we only want to jump if the full (incl. border) row is away
			if (y + row_height + actual_border_collapsed_width > scroll_top) {
				// this is the last index still inside the viewport
				new_start = i;
				top = y - (head_height + row_top_border / 2);
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
			if (y > scroll_top + viewport_height) {
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
		bottom = remaining_height;
		if (!isFinite(bottom)) {
			bottom = 200000;
		}
	}

	export async function scroll_to_index(
		index: number,
		opts: ScrollToOptions,
		align_end = false
	): Promise<void> {
		await tick();

		const _itemHeight = average_height;

		let distance = index * _itemHeight;
		if (align_end) {
			distance = distance - viewport_height + _itemHeight + head_height;
		}

		const scrollbar_height = viewport.offsetHeight - viewport.clientHeight;
		if (scrollbar_height > 0) {
			distance += scrollbar_height;
		}

		const _opts = {
			top: distance,
			behavior: "smooth" as ScrollBehavior,
			...opts
		};

		viewport.scrollTo(_opts);
	}

	$: sortedItems = items;

	$: visible = sortedItems.slice(start, end).map((data, i) => {
		return { index: i + start, data };
	});

	onMount(() => {
		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		mounted = true;
		refresh_height_map(items);
	});
</script>

<svelte-virtual-table-viewport>
	<table
		class="table"
		bind:this={viewport}
		bind:offsetHeight={viewport_height}
		on:scroll={handle_scroll}
		style="height: {height}; --bw-svt-p-top: {top}px; --bw-svt-p-bottom: {bottom}px; --bw-svt-head-height: {head_height}px; --bw-svt-foot-height: {foot_height}px; --bw-svt-avg-row-height: {average_height}px"
	>
		<thead class="thead" bind:offsetHeight={head_height}>
			<slot name="thead" />
		</thead>
		<tbody bind:this={contents} class="tbody">
			{#if visible.length && visible[0].data.length}
				{#each visible as item (item.data[0].id)}
					<slot name="tbody" item={item.data} index={item.index}>
						Missing Table Row
					</slot>
				{/each}
			{/if}
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
