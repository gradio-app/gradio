<script lang="ts">
	import { onMount, tick, createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	export let items: any[][] = [];

	export let max_height: number;
	export let actual_height: number;
	export let table_scrollbar_width: number;
	export let start = 0;
	export let end = 20;
	export let selected: number | false;
	export let disable_scroll = false;
	export let show_scroll_button = false;
	export let viewport: HTMLTableElement;

	const dispatch = createEventDispatcher<{
		scroll_top: number;
	}>();

	let height = "100%";

	let average_height = 30;
	let bottom = 0;
	let contents: HTMLTableSectionElement;
	let head_height = 0;
	let foot_height = 0;
	let height_map: number[] = [];
	let mounted: boolean;
	let rows: HTMLCollectionOf<HTMLTableRowElement>;
	let top = 0;
	let viewport_height = 200;
	let visible: { index: number; data: any[] }[] = [];
	let viewport_box: DOMRectReadOnly;

	$: viewport_height = viewport_box?.height || 200;

	const is_browser = typeof window !== "undefined";
	const raf = is_browser
		? window.requestAnimationFrame
		: (cb: (...args: any[]) => void) => cb();

	$: {
		if (mounted && viewport_height && viewport.offsetParent) {
			sortedItems, raf(refresh_height_map);
		}
	}

	async function refresh_height_map(): Promise<void> {
		if (sortedItems.length < start) {
			await scroll_to_index(sortedItems.length - 1, { behavior: "auto" });
		}

		const scrollTop = Math.max(0, viewport.scrollTop);
		show_scroll_button = scrollTop > 100;
		table_scrollbar_width = viewport.offsetWidth - viewport.clientWidth;

		// acquire height map for currently visible rows
		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = rows[v].getBoundingClientRect().height;
		}
		let i = 0;
		let y = head_height;
		// loop items to find new start
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			// keep a page of rows buffered above
			if (y + row_height > scrollTop - max_height) {
				start = i;
				top = y - head_height;
				break;
			}
			y += row_height;
			i += 1;
		}

		let content_height = head_height;
		while (i < sortedItems.length) {
			const row_height = height_map[i] || average_height;
			content_height += row_height;
			i += 1;
			// keep a page of rows buffered below
			if (content_height - head_height > 3 * max_height) {
				break;
			}
		}

		end = i;
		const remaining = sortedItems.length - end;

		const scrollbar_height = viewport.offsetHeight - viewport.clientHeight;
		if (scrollbar_height > 0) {
			content_height += scrollbar_height;
		}

		let filtered_height_map = height_map.filter((v) => typeof v === "number");
		average_height =
			filtered_height_map.reduce((a, b) => a + b, 0) /
				filtered_height_map.length || 30;

		bottom = remaining * average_height;
		if (!isFinite(bottom)) {
			bottom = 200000;
		}
		height_map.length = sortedItems.length;
		while (i < sortedItems.length) {
			i += 1;
			height_map[i] = average_height;
		}
		if (max_height && content_height > max_height) {
			actual_height = max_height;
		} else {
			actual_height = content_height;
		}
	}

	$: scroll_and_render(selected);

	async function scroll_and_render(n: number | false): Promise<void> {
		raf(async () => {
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

	$: visible = is_browser
		? sortedItems.slice(start, end).map((data, i) => {
				return { index: i + start, data };
			})
		: sortedItems
				.slice(0, (max_height / sortedItems.length) * average_height + 1)
				.map((data, i) => {
					return { index: i + start, data };
				});

	onMount(() => {
		rows = contents.children as HTMLCollectionOf<HTMLTableRowElement>;
		mounted = true;
	});
</script>

<svelte-virtual-table-viewport>
	<div>
		<table
			class="table"
			class:disable-scroll={disable_scroll}
			bind:this={viewport}
			bind:contentRect={viewport_box}
			on:scroll={refresh_height_map}
			style="height: {height}; --bw-svt-p-top: {top}px; --bw-svt-p-bottom: {bottom}px; --bw-svt-head-height: {head_height}px; --bw-svt-foot-height: {foot_height}px; --bw-svt-avg-row-height: {average_height}px; --max-height: {max_height}px"
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
	</div>
</svelte-virtual-table-viewport>

<style type="text/css">
	table {
		position: relative;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		max-height: var(--max-height);
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
		border-collapse: separate;
		scrollbar-width: thin;
		scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
	}

	table::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	table::-webkit-scrollbar-track {
		background: transparent;
	}

	table::-webkit-scrollbar-thumb {
		background-color: rgba(128, 128, 128, 0.5);
		border-radius: 4px;
	}

	table:hover {
		scrollbar-color: rgba(160, 160, 160, 0.7) transparent;
	}

	table:hover::-webkit-scrollbar-thumb {
		background-color: rgba(160, 160, 160, 0.7);
		border-radius: 4px;
		width: 4px;
	}

	@media (hover: none) {
		table {
			scrollbar-color: rgba(160, 160, 160, 0.7) transparent;
		}

		table::-webkit-scrollbar-thumb {
			background-color: rgba(160, 160, 160, 0.7);
			border-radius: 4px;
		}
	}

	@media (pointer: coarse) {
		table::-webkit-scrollbar {
			width: 8px;
			height: 8px;
		}
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

	tbody :global(td.pinned-column) {
		position: sticky;
		z-index: 3;
	}

	tbody :global(tr:nth-child(odd)) :global(td.pinned-column) {
		background: var(--table-odd-background-fill);
	}

	tbody :global(tr:nth-child(even)) :global(td.pinned-column) {
		background: var(--table-even-background-fill);
	}

	tbody :global(td.last-pinned) {
		border-right: 1px solid var(--border-color-primary);
	}

	thead {
		position: sticky;
		top: 0;
		left: 0;
		background: var(--background-fill-primary);
		z-index: 7;
	}

	thead :global(th) {
		background: var(--table-even-background-fill) !important;
	}

	thead :global(th.pinned-column) {
		position: sticky;
		z-index: 7;
		background: var(--table-even-background-fill) !important;
	}

	thead :global(th.last-pinned) {
		border-right: 1px solid var(--border-color-primary);
	}

	.table.disable-scroll {
		overflow: hidden !important;
	}
</style>
