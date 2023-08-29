<script lang="ts">
	const CLASSNAME_TABLE = "tablesort"; // keep same for compatibility with https://github.com/mattiash/svelte-tablesort
	const CLASSNAME_SORTABLE = "sortable";
	const CLASSNAME_ASC = "ascending";
	const CLASSNAME_DESC = "descending";

	// import { compareNumbers, compareStrings, sortFunction } from "generator-sort";
	import { onMount, tick } from "svelte";
	import { _ } from "svelte-i18n";
	type SortDirection = "asc" | "des";

	// props
	export let items: any[][] = [];
	let className = "";
	export { className as class };
	export let sort: [number | undefined, SortDirection | undefined] = [
		undefined,
		undefined
	];
	export let table_width: number;
	export let max_height: number;
	export let actual_height;

	// MARK: virtual stuff
	let height = "100%"; // the height of the viewport/table

	// read-only, but visible to consumers via bind:start resp. bind:end
	export let start = 0; // the index of the first visible item
	export let end = 0; // the index of the last visible item

	// local state
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

	// whenever `items` changes, invalidate the current heightmap
	$: if (mounted)
		requestAnimationFrame(() =>
			refresh_height_map(sortedItems, viewport_height)
		);

	let content_height = 0;
	async function refresh_height_map(
		_items: typeof items,
		viewport_height: number
	): Promise<void> {
		if (viewport_height === 0 || table_width === 0) {
			return;
		}
		const { scrollTop } = viewport;
		await tick(); // wait until the DOM is up to date
		content_height = top - (scrollTop - head_height);
		let i = start;
		while (content_height - 3 < max_height - head_height && i < _items.length) {
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
		average_height = (top + content_height) / end;
		bottom = remaining * average_height + foot_height;
		height_map.length = _items.length;
		await scroll_to_index(0, { behavior: "auto" });
	}

	$: {
		if (!max_height) {
			actual_height = content_height + 3;
		} else if (content_height < max_height) {
			actual_height = content_height + 3;
		} else {
			actual_height = max_height;
		}
	}

	function get_computed_px_amount(elem: HTMLElement, property: string): number {
		const compStyle = getComputedStyle(elem);

		let x = parseInt(compStyle.getPropertyValue(property));
		return x;
	}

	async function handle_scroll(): Promise<void> {
		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		const is_start_overflow = sortedItems.length < start;

		const row_top_border = get_computed_px_amount(rows[1], "border-top-width");

		const actual_border_collapsed_width = 0;

		if (is_start_overflow) {
			await scroll_to_index(sortedItems.length - 1, { behavior: "auto" });
		}

		const { scrollTop } = viewport;
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
			if (y + row_height + actual_border_collapsed_width > scrollTop) {
				// this is the last index still inside the viewport
				new_start = i;
				top = y - (head_height + row_top_border / 2); //+ rowBottomBorder - rowTopBorder
				break;
			}
			y += row_height;
			i += 1;
		}

		new_start = Math.max(0, new_start);
		// loop items to find end
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			y += row_height;
			i += 1;
			if (y > scrollTop + viewport_height) {
				break;
			}
		}
		start = new_start;
		end = i;
		const remaining = sortedItems.length - end;
		if (end === 0) {
			end = 10;
		}
		average_height = y / end;
		let remaining_height = remaining * average_height; // 0
		// compute height map for remaining items
		while (i < sortedItems.length) {
			i += 1;
			height_map[i] = average_height;
			// remaining_height += height_map[i] / remaining
		}
		// find the
		bottom = remaining_height;
		if (!isFinite(bottom)) {
			bottom = 200000;
		}
		// console.timeEnd(t);
	}

	export async function scroll_to_index(
		index: number,
		opts: ScrollToOptions
	): Promise<void> {
		const { scrollTop } = viewport;
		const itemsDelta = index - start;
		const _itemHeight = average_height;
		const distance = itemsDelta * _itemHeight;
		const _opts = {
			left: 0,
			top: scrollTop + distance,
			behavior: "smooth" as ScrollBehavior,
			...opts
		};
		viewport.scrollTo(_opts);
	}

	// MARK: table sort stuff
	let sortOrder = [[]];

	$: sortedItems = sorted(items, sort[0], sort[1]);

	$: visible = sortedItems.slice(start, end).map((data, i) => {
		return { index: i + start, data };
	});

	// const sorted = function (arr, sortOrder) {
	// 	arr.sort(
	// 		sortFunction(function* (a, b) {
	// 			for (let [fieldName, r] of sortOrder) {
	// 				const reverse = r === 0 ? 1 : -1;
	// 				if (typeof a[fieldName] === "number") {
	// 					yield reverse * compareNumbers(a[fieldName], b[fieldName]);
	// 				} else {
	// 					yield reverse * compareStrings(a[fieldName], b[fieldName]);
	// 				}
	// 			}
	// 		})
	// 	);

	// 	return arr;
	// };

	function sort_data(
		data: typeof items,
		col?: number,
		dir?: SortDirection
	): typeof items {
		if (!col || !dir) {
			return data;
		}
		if (dir === "asc") {
			return data.sort((a, b) => (a[col].value < b[col].value ? -1 : 1));
		} else if (dir === "des") {
			return data.sort((a, b) => (a[col].value > b[col].value ? -1 : 1));
		}

		return data;
	}

	function throttle(func: any, delay = 0): () => any {
		let lastCall = 0;
		return function (...args) {
			const now = new Date().getTime();
			if (now - lastCall < delay) {
				return;
			}
			lastCall = now;
			//@ts-ignore
			return func.apply(this, args);
		};
	}

	const throttle_scroll = throttle(handle_scroll, 16);

	const sorted = (
		_items: typeof items,
		col?: number,
		direction?: SortDirection
	): typeof items => sort_data(_items, col, direction);

	onMount(() => {
		// triggger initial refresh for virtual
		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		mounted = true;
		refresh_height_map(items, viewport_height);
	});
</script>

<svelte-virtual-table-viewport>
	<table
		class="{CLASSNAME_TABLE}
      {className} table"
		bind:this={viewport}
		bind:offsetHeight={viewport_height}
		on:scroll={throttle_scroll}
		style="width:{table_width}px; height: {height}; --bw-svt-p-top: {top}px; --bw-svt-p-bottom: {bottom}px; --bw-svt-head-height: {head_height}px; --bw-svt-foot-height: {foot_height}px; --bw-svt-avg-row-height: {average_height}px"
	>
		<thead class="thead" bind:offsetHeight={head_height}>
			<slot name="thead" />
		</thead>
		<tbody bind:this={contents} class="tbody">
			{#each visible as item}
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
	/* table {
		transition: 150ms;
		width: var(--size-full);
		table-layout: auto;
		overflow: hidden;
	
	} */
	table {
		/* opacity: 0; */
		position: relative;
		overflow-y: scroll;
		overflow-x: hidden;
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
		/* table-layout: fixed; */
		border-spacing: 0;
	}
	table :is(thead, tfoot, tbody) {
		display: table;
		table-layout: fixed;
		width: 100%;
		box-sizing: border-box;
	}
	table.require-border-collapse thead {
		min-height: calc(var(--bw-svt-p-top));
	}
	table.require-border-collapse tfoot {
		min-height: calc(var(--bw-svt-p-bottom));
	}

	table:not(.require-border-collapse) tbody {
		padding-top: var(--bw-svt-p-top);
		padding-bottom: var(--bw-svt-p-bottom);
	}
	tbody {
		position: relative;
		box-sizing: border-box;
		border: 0px solid currentColor;
	}

	/** sortable styles */
	thead :global(th.sortable) {
		cursor: pointer;
		user-select: none;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	tbody > :global(tr:last-child) {
		border: none;
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
