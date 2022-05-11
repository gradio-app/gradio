<script lang="ts">
	export let value: any;
	export let depth: number;
	export let collapsed = depth > 4;
	export let style: string | undefined = "";
</script>

<div class="json-node inline text-sm font-mono leading-tight" {style}>
	{#if value instanceof Array}
		{#if collapsed}
			<button
				on:click={() => {
					collapsed = false;
				}}
			>
				<span
					class="bg-gray-50 hover:bg-gray-100 px-1 border rounded text-gray-700 dark:hover:bg-gray-800"
					>expand {value.length} children</span
				>
			</button>
		{:else}
			[
			<div class="json-children pl-4">
				{#each value as node, i}
					<div class="json-item">
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
			<div class="json-children pl-4">
				{#each Object.entries(value) as node, i}
					<div class="json-item">
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
		<div
			class="json-item inline text-gray-500 dark:text-gray-400"
			item-type="null"
		>
			null
		</div>
	{:else if typeof value === "string"}
		<div class="json-item inline text-green-500" item-type="string">
			"{value}"
		</div>
	{:else if typeof value === "boolean"}
		<div class="json-item inline text-red-500" item-type="boolean">
			{value.toLocaleString()}
		</div>
	{:else if typeof value === "number"}
		<div class="json-item inline text-blue-500" item-type="number">
			{value}
		</div>
	{:else}
		<div class="json-item inline" item-type="other">
			{value}
		</div>
	{/if}
</div>
