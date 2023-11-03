<script lang="ts">
	import type { Node } from "./utils";
	import { createEventDispatcher, tick } from "svelte";

	import Arrow from "./ArrowIcon.svelte";
	import Checkbox from "./Checkbox.svelte";
	import FileIcon from "../icons/light-file.svg";

	export let interactive: boolean;
	export let tree: Node[] = [];
	export let icons: any = {};
	export let node_indices: number[] = [];
	export let file_count: "single" | "multiple" = "multiple";

	const dispatch = createEventDispatcher<{
		check: { node_indices: number[]; checked: boolean };
	}>();

	async function dispatch_change(i: number): Promise<void> {
		await tick();

		dispatch("check", {
			node_indices: [...node_indices, i],
			checked: !tree[i].checked
		});
	}
</script>

<ul>
	{#each tree as { type, path, children, children_visible, checked }, i}
		<li>
			<span class="wrap">
				<Checkbox
					disabled={!interactive ||
						(type === "folder" && file_count === "single")}
					bind:value={checked}
					on:change={() => dispatch_change(i)}
				/>

				{#if type === "folder"}
					<span
						class="icon"
						class:hidden={!tree[i].children_visible}
						on:click|stopPropagation={() =>
							(tree[i].children_visible = !tree[i].children_visible)}
						role="button"
						aria-label="expand directory"
						tabindex="0"
						on:keydown={({ key }) =>
							(key === " " || key === "Enter") &&
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
				<svelte:self
					tree={children}
					{icons}
					on:check
					node_indices={[...node_indices, i]}
					{interactive}
					{file_count}
				/>
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
		flex-shrink: 0;
	}

	.file-icon {
		display: inline-block;
		height: 20px;
		margin-left: -1px;
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

	.icon:hover :global(> *) {
		color: var(--block-info-text-color);
	}

	.icon :global(> *) {
		transform: rotate(90deg);
		transform-origin: 40% 50%;
		transition: 0.2s;
		color: var(--color-accent);
	}

	.hidden :global(> *) {
		transform: rotate(0);
		color: var(--body-text-color-subdued);
	}

	ul {
		margin-left: 26px;
		padding-left: 0;
		list-style: none;
	}

	li {
		margin-left: 0;
		padding-left: 0;
		align-items: center;
		margin: 8px 0;
		font-family: var(--font-mono);
		font-size: var(--scale-00);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.wrap {
		display: flex;
		gap: 8px;
		align-items: center;
	}
</style>
