<script>
	import Arrow from "./ArrowIcon.svelte";
	import Checkbox from "./Checkbox.svelte";
	export let checked = true;
	export let hidden = false;
	export let tree = [
		"folder",
		["folder", ["file", "file"]],
		"folder",
		["folder", ["file", "file"]],
		"folder",
		["folder", ["file", "file", "folder", ["folder", ["file", "file"], "file"]]]
	];

	function process_tree(state, node) {
		if (Array.isArray(node)) {
			// Create a new array to store the processed items
			const result = [];
			for (let i = 0; i < node.length; i++) {
				// If it's a string, convert it to true/false and add to the result

				// If it's an array, recursively process it and add the processed array to the result
				if (Array.isArray(node[i])) {
					result.push(process_tree(node[i]));
				} else {
					result.push(state);
				}
			}
			return result;
		}
		return [];
	}

	function handle_change(i) {
		console.log(checked_tree, i);

		checked_tree[i] = !checked_tree[i];
		// checked_tree = checked_tree
	}

	$: checked_tree = process_tree(checked, tree);
	$: hidden_tree = tree.map((v) => (typeof v === "string" ? hidden : true));

	$: console.log(checked, hidden_tree);
</script>

<!-- Render directory or file -->
<ul>
	{#each tree as file_or_folder, i}
		<li>
			{#if Array.isArray(file_or_folder) && !hidden_tree[i - 1]}
				<svelte:self
					tree={file_or_folder}
					checked={checked_tree[i - 1]}
					hidden={hidden_tree[i]}
				/>
			{:else if typeof file_or_folder === "string"}
				<Checkbox bind:value={checked_tree[i]} />
				{#if Array.isArray(tree[i + 1])}
					<span
						class:hidden={hidden_tree[i]}
						on:click|stopPropagation={() => {}}><Arrow /></span
					>
				{/if}
				{file_or_folder}
			{/if}
		</li>
	{/each}
</ul>

<style>
	span {
		display: inline-block;
		width: 8px;
		height: 8px;
		padding: 3px 3px 3px 3px;
		margin: 0;
		flex-grow: 0;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		border-radius: 2px;
		cursor: pointer;
		transition: 0.1s;
	}

	span:hover {
		background: #eee;
	}

	span :global(> *) {
		transform: rotate(90deg);
		transform-origin: 40% 50%;
		transition: 0.1s;
	}

	.hidden :global(> *) {
		transform: rotate(0);
	}
	ul {
		margin-left: 10px;
		padding-left: 0;
		list-style: none;
	}

	li {
		margin-left: 0;
		padding-left: 0;
		display: flex;
		align-items: center;
		gap: 5px;
	}
</style>
