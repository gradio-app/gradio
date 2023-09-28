<script lang="ts">
	import type { Node } from "./DirectoryExplorer.svelte";

	import Arrow from "./ArrowIcon.svelte";
	import Checkbox from "./Checkbox.svelte";
	import FileIcon from "../icons/light-file.svg";

	import { tick } from "svelte";

	export let mode: "static" | "interactive";
	export let tree: Node[] = [];
	export let icons: any = {};

	function set_checked(node: Node[] | null, checked: boolean): void {
		if (node === null) return;
		for (let i = 0; i < node.length; i++) {
			node[i].checked = checked;
			set_checked(node[i].children, checked);
		}
	}

	async function process_tree(i: number): Promise<void> {
		await tick();

		if (tree[i].type === "folder") {
			set_checked(tree[i].children, tree[i].checked);
		}

		tree = tree;
	}
</script>

<!-- Render directory or file -->
<ul>
	{#each tree as { type, path, children, children_visible, checked }, i}
		<li>
			<span class="wrap"
				><Checkbox bind:value={checked} on:change={() => process_tree(i)} />

				{#if type === "folder"}
					<span
						class="icon"
						class:hidden={!tree[i].children_visible}
						on:click|stopPropagation={() =>
							(tree[i].children_visible = !tree[i].children_visible)}
						role="button"
						tabindex="0"
						on:keydown={({ key }) =>
							key === " " &&
							(tree[i].children_visible = !tree[i].children_visible)}
						><Arrow /></span
					>
				{:else}
					<span class="file-icon">
						<img src={FileIcon} alt="file icon" />
					</span>
				{/if}
				{path}
			</span>
			{#if children && children_visible}
				<svelte:self tree={children} {icons} />
			{/if}
		</li>
	{/each}
</ul>

<style>
	.icon {
		display: inline-block;
		width: 18px;
		height: 18px;
		padding: 3px 2px 3px 3px;
		margin: 0;
		flex-grow: 0;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		border-radius: 2px;
		cursor: pointer;
		transition: 0.1s;
		color: var(--color-accent);
	}

	.file-icon {
		display: inline-block;
		height: 20px;
		margin-left: -1px;
		/* height: 20px; */
		/* padding: 3px 3px 3px 3px; */
		margin: 0;
		flex-grow: 0;
		display: inline-flex;
		justify-content: center;
		align-items: center;

		transition: 0.1s;
	}

	.file-icon img {
		width: 100%;
		height: 100%;
	}

	.icon:hover {
		background: #eee;
	}

	.icon :global(> *) {
		transform: rotate(90deg);
		transform-origin: 40% 50%;
		transition: 0.2s;
	}

	.hidden :global(> *) {
		transform: rotate(0);
		color: #666;
	}
	ul {
		margin-left: 26px;
		padding-left: 0;
		list-style: none;
	}

	li {
		margin-left: 0;
		padding-left: 0;
		/* display: flex; */
		align-items: center;
		margin: 8px 0;
		font-family: var(--font-mono);
		font-size: var(--scale-00);
	}

	.wrap {
		display: flex;
		gap: 8px;
		align-items: center;
	}
</style>
