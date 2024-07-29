<script lang="ts">
	import { onMount, createEventDispatcher, tick } from "svelte";

	export let value: any;
	export let depth = 0;
	export let is_root = false;
	export let is_last_item = true;
	export let key: string | number | null = null;

	const dispatch = createEventDispatcher();
	let root_element: HTMLElement;
	let collapsed = false;
	let child_nodes: any[] = [];

	function is_collapsible(val: any): boolean {
		return val !== null && (typeof val === "object" || Array.isArray(val));
	}

	async function toggle_collapse(): Promise<void> {
		collapsed = !collapsed;
		await tick();
		dispatch("toggle", { collapsed, depth });
	}

	function get_collapsed_preview(val: any): string {
		if (Array.isArray(val)) {
			return `Array(${val.length})`;
		} else if (typeof val === "object" && val !== null) {
			return `Object(${Object.keys(val).length})`;
		}
		return String(val);
	}

	$: if (is_collapsible(value)) {
		child_nodes = Object.entries(value);
	} else {
		child_nodes = [];
	}

	onMount(() => {
		if (is_root) {
			const lines = root_element.querySelectorAll(".line");
			lines.forEach((line, index) => {
				const line_number = line.querySelector(".line-number");
				if (line_number) {
					line_number.textContent = (index + 1).toString();
				}
			});
		}
	});
</script>

<div class="json-node" class:root={is_root} bind:this={root_element} on:toggle>
	<div class="line" class:collapsed>
		<span class="line-number"></span>
		<span class="content" style="--depth: {depth};">
			{#if is_collapsible(value)}
				<button class="toggle" on:click={toggle_collapse}
					>{collapsed ? "▶" : "▼"}</button
				>
			{/if}
			{#if key !== null}
				<span class="key">"{key}"</span><span class="punctuation colon"
					>:
				</span>
			{/if}
			{#if is_collapsible(value)}
				<span class="punctuation bracket"
					>{Array.isArray(value) ? "[" : "{"}</span
				>
				{#if collapsed}
					<span class="preview">{get_collapsed_preview(value)}</span>
					<span class="punctuation bracket"
						>{Array.isArray(value) ? "]" : "}"}</span
					>
				{/if}
			{:else if typeof value === "string"}
				<span class="value string">"{value}"</span>
			{:else if typeof value === "number"}
				<span class="value number">{value}</span>
			{:else if typeof value === "boolean"}
				<span class="value bool">{value.toString()}</span>
			{:else if value === null}
				<span class="value null">null</span>
			{:else}
				<span>{value}</span>
			{/if}
			{#if !is_last_item && (!is_collapsible(value) || collapsed)}<span
					class="punctuation">,</span
				>{/if}
		</span>
	</div>

	{#if is_collapsible(value)}
		<div class="children" class:hidden={collapsed}>
			{#each child_nodes as [subKey, subVal], i}
				<svelte:self
					value={subVal}
					depth={depth + 1}
					is_last_item={i === child_nodes.length - 1}
					key={subKey}
					on:toggle
				/>
			{/each}
			<div class="line">
				<span class="line-number"></span>
				<span class="content" style="--depth: {depth};">
					<span class="punctuation bracket"
						>{Array.isArray(value) ? "]" : "}"}</span
					>
					{#if !is_last_item}<span class="punctuation">,</span>{/if}
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.json-node {
		color: var(--body-text-color);
		font-family: var(--font-mono);
	}
	.json-node.root {
		position: relative;
		padding-left: var(--size-10);
	}
	.line {
		display: flex;
		align-items: flex-start;
		padding: 0;
		margin: 0;
		line-height: var(--line-md);
	}
	.line-number {
		position: absolute;
		left: 0;
		width: var(--size-7);
		text-align: right;
		color: var(--body-text-color-subdued);
		user-select: none;
		text-overflow: ellipsis;
	}
	.content {
		flex: 1;
		display: flex;
		align-items: center;
		padding-left: calc(var(--depth) * var(--size-2));
	}
	.children {
		padding-left: var(--size-4);
	}
	.children.hidden {
		display: none;
	}

	.null {
		color: var(--body-text-color-subdued);
	}

	.string {
		color: var(--color-green-500);
	}
	.number {
		color: var(--color-blue-500);
	}
	.bool {
		color: var(--color-red-500);
	}

	.value {
		margin-left: var(--spacing-md);
	}
	.bracket {
		margin-left: var(--spacing-sm);
	}

	.toggle {
		user-select: none;
		margin-right: var(--spacing-md);
	}
	.preview {
		color: var(--body-text-color-subdued);
		margin: 0 var(--spacing-sm) 0 var(--spacing-lg);
	}
</style>
