<script lang="ts">
	import { onMount, createEventDispatcher, tick, afterUpdate } from "svelte";

	export let value: any;
	export let depth = 0;
	export let is_root = false;
	export let is_last_item = true;
	export let key: string | number | null = null;
	export let open = false;
	export let theme_mode: "system" | "light" | "dark" = "system";
	export let show_indices = false;
	export let interactive = true;

	const dispatch = createEventDispatcher();
	let root_element: HTMLElement;
	let collapsed = open ? false : depth >= 3;
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
		if (Array.isArray(val)) return `Array(${val.length})`;
		if (typeof val === "object" && val !== null)
			return `Object(${Object.keys(val).length})`;
		return String(val);
	}

	$: if (is_collapsible(value)) {
		child_nodes = Object.entries(value);
	} else {
		child_nodes = [];
	}
	$: if (is_root && root_element) {
		updateLineNumbers();
	}

	function updateLineNumbers(): void {
		const lines = root_element.querySelectorAll(".line");
		lines.forEach((line, index) => {
			const line_number = line.querySelector(".line-number");
			if (line_number) {
				line_number.setAttribute("data-pseudo-content", (index + 1).toString());
				line_number?.setAttribute(
					"aria-roledescription",
					`Line number ${index + 1}`
				);
				line_number?.setAttribute("title", `Line number ${index + 1}`);
			}
		});
	}

	onMount(() => {
		if (is_root) {
			updateLineNumbers();
		}
	});

	afterUpdate(() => {
		if (is_root) {
			updateLineNumbers();
		}
	});
</script>

<div
	class="json-node"
	class:root={is_root}
	class:dark-mode={theme_mode === "dark"}
	bind:this={root_element}
	on:toggle
	style="--depth: {depth};"
>
	<div class="line" class:collapsed>
		<span class="line-number"></span>
		<span class="content">
			{#if is_collapsible(value)}
				<button
					data-pseudo-content={interactive ? (collapsed ? "▶" : "▼") : ""}
					aria-label={collapsed ? "Expand" : "Collapse"}
					class="toggle"
					disabled={!interactive}
					on:click={toggle_collapse}
				/>
			{/if}
			{#if key !== null}
				<span class="key">"{key}"</span><span class="punctuation colon"
					>:
				</span>
			{/if}
			{#if is_collapsible(value)}
				<span
					class="punctuation bracket"
					class:square-bracket={Array.isArray(value)}
					>{Array.isArray(value) ? "[" : "{"}</span
				>
				{#if collapsed}
					<button on:click={toggle_collapse} class="preview">
						{get_collapsed_preview(value)}
					</button>
					<span
						class="punctuation bracket"
						class:square-bracket={Array.isArray(value)}
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
			{#if !is_last_item && (!is_collapsible(value) || collapsed)}
				<span class="punctuation">,</span>
			{/if}
		</span>
	</div>

	{#if is_collapsible(value)}
		<div class="children" class:hidden={collapsed}>
			{#each child_nodes as [subKey, subVal], i}
				<svelte:self
					value={subVal}
					depth={depth + 1}
					is_last_item={i === child_nodes.length - 1}
					key={Array.isArray(value) && !show_indices ? null : subKey}
					{open}
					{theme_mode}
					{show_indices}
					on:toggle
				/>
			{/each}
			<div class="line">
				<span class="line-number"></span>
				<span class="content">
					<span
						class="punctuation bracket"
						class:square-bracket={Array.isArray(value)}
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
		font-family: var(--font-mono);
		--text-color: #d18770;
		--key-color: var(--text-color);
		--string-color: #ce9178;
		--number-color: #719fad;

		--bracket-color: #5d8585;
		--square-bracket-color: #be6069;
		--punctuation-color: #8fbcbb;
		--line-number-color: #6a737d;
		--separator-color: var(--line-number-color);
	}
	.json-node.dark-mode {
		--bracket-color: #7eb4b3;
		--number-color: #638d9a;
	}
	.json-node.root {
		position: relative;
		padding-left: var(--size-14);
	}
	.json-node.root::before {
		content: "";
		position: absolute;
		top: 0;
		bottom: 0;
		left: var(--size-11);
		width: 1px;
		background-color: var(--separator-color);
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
		width: calc(var(--size-7));
		text-align: right;
		color: var(--line-number-color);
		user-select: none;
		text-overflow: ellipsis;
		text-overflow: ellipsis;
		direction: rtl;
		overflow: hidden;
	}
	.content {
		flex: 1;
		display: flex;
		align-items: center;
		padding-left: calc(var(--depth) * var(--size-2));
		flex-wrap: wrap;
	}
	.children {
		padding-left: var(--size-4);
	}
	.children.hidden {
		display: none;
	}
	.key {
		color: var(--key-color);
	}
	.string {
		color: var(--string-color);
	}
	.number {
		color: var(--number-color);
	}
	.bool {
		color: var(--text-color);
	}
	.null {
		color: var(--text-color);
	}
	.value {
		margin-left: var(--spacing-md);
	}
	.punctuation {
		color: var(--punctuation-color);
	}
	.bracket {
		margin-left: var(--spacing-sm);
		color: var(--bracket-color);
	}
	.square-bracket {
		margin-left: var(--spacing-sm);
		color: var(--square-bracket-color);
	}
	.toggle,
	.preview {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		margin: 0;
	}
	.toggle {
		user-select: none;
		margin-right: var(--spacing-md);
	}
	.preview {
		margin: 0 var(--spacing-sm) 0 var(--spacing-lg);
	}
	.preview:hover {
		text-decoration: underline;
	}

	:global([data-pseudo-content])::before {
		content: attr(data-pseudo-content);
	}
</style>
