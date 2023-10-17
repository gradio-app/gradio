<script lang="ts">
	export let value: any;
	export let depth: number;
	export let collapsed = depth > 4;
</script>

<span class="spacer" class:mt-10={depth === 0} />
<div class="json-node">
	{#if value instanceof Array}
		{#if collapsed}
			<button
				on:click={() => {
					collapsed = false;
				}}
			>
				<span class="expand-array">expand {value.length} children</span>
			</button>
		{:else}
			[
			<div class="children">
				{#each value as node, i}
					<div>
						{i}: <svelte:self value={node} depth={depth + 1} />
						{#if i !== value.length - 1}
							,
						{/if}
					</div>
				{/each}
			</div>
			]
		{/if}
	{:else if value instanceof Object}
		{#if collapsed}
			<button
				on:click={() => {
					collapsed = false;
				}}
			>
				&#123;+{Object.keys(value).length} items&#125;
			</button>
		{:else}
			&#123;
			<div class="children">
				{#each Object.entries(value) as node, i}
					<div>
						{node[0]}: <svelte:self
							value={node[1]}
							depth={depth + 1}
							key={i}
						/><!--
		-->{#if i !== Object.keys(value).length - 1}<!--
		-->,
						{/if}
					</div>
				{/each}
			</div>
			&#125;
		{/if}
	{:else if value === null}
		<div class="json-item null">null</div>
	{:else if typeof value === "string"}
		<div class="json-item string">
			"{value}"
		</div>
	{:else if typeof value === "boolean"}
		<div class="json-item bool">
			{value.toLocaleString()}
		</div>
	{:else if typeof value === "number"}
		<div class="json-item number">
			{value}
		</div>
	{:else}
		<div class="json-item">
			{value}
		</div>
	{/if}
</div>

<style>
	.spacer {
		display: inline-block;
		width: 0;
		height: 0;
	}

	.json-node {
		display: inline;
		color: var(--body-text-color);
		line-height: var(--line-sm);
		font-family: var(--font-mono);
	}

	.expand-array {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		background: var(--background-fill-secondary);
		padding: 0 var(--size-1);
		color: var(--body-text-color);
	}

	.expand-array:hover {
		background: var(--background-fill-primary);
	}

	.children {
		padding-left: var(--size-4);
	}

	.json-item {
		display: inline;
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
</style>
