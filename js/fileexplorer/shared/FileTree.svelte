<script lang="ts">
	import type { FileNode } from "./types";
	import { createEventDispatcher } from "svelte";

	import Arrow from "./ArrowIcon.svelte";
	import Checkbox from "./Checkbox.svelte";
	import FileIcon from "../icons/light-file.svg";
	import FolderIcon from "../icons/light-folder.svg";

	export let path: string[] = [];
	export let selected: string[][] = [];
	export let interactive: boolean;
	export let ls_fn: (path: string[]) => Promise<FileNode[]>;
	export let file_count: "single" | "multiple" = "multiple";

	let content: FileNode[] = [];
	let opened_folders: number[] = [];

	const toggle_open_folder = (i: number): void => {
		if (opened_folders.includes(i)) {
			opened_folders = opened_folders.filter((x) => x !== i);
		} else {
			opened_folders = [...opened_folders, i];
		}
	};

	(async () => {
		content = await ls_fn(path);
	})();

	const dispatch = createEventDispatcher<{
		check: { path: string[]; checked: boolean; type: "file" | "folder" };
	}>();
</script>

<ul>
	{#each content as { type, name, valid }, i}
		<li>
			<span class="wrap">
				<Checkbox
					disabled={!interactive}
					value={selected.some((x) => x[0] === name && x.length === 1)}
					on:change={(e) => {
						let { checked, shiftKey } = e.detail;
						if (file_count === "single" || !shiftKey || selected.length === 0) {
							dispatch("check", {
								path: [...path, name],
								checked,
								type
							});
						} else {
							let content_names = content.map((item) => item.name);
							let last_selected_name = selected[selected.length - 1][0];
							let last_index = content_names.indexOf(last_selected_name);
							if (last_index === -1) {
								dispatch("check", {
									path: [...path, name],
									checked,
									type
								});
							} else {
								let new_index = content_names.indexOf(name);
								if (new_index < last_index) {
									[last_index, new_index] = [new_index, last_index];
								}
								content
									.slice(last_index, new_index + 1)
									.forEach((item, index) => {
										dispatch("check", {
											path: [...path, item.name],
											checked,
											type: item.type
										});
									});
							}
						}
					}}
				/>

				{#if type === "folder"}
					<span
						class="icon"
						class:hidden={!opened_folders.includes(i)}
						on:click|stopPropagation={() => toggle_open_folder(i)}
						role="button"
						aria-label="expand directory"
						tabindex="0"
						on:keydown={({ key }) => {
							if (key === " " || key === "Enter") {
								toggle_open_folder(i);
							}
						}}><Arrow /></span
					>
				{/if}
				<span class="file-icon">
					<img src={type === "file" ? FileIcon : FolderIcon} alt="file icon" />
				</span>
				{name}
			</span>
			{#if type === "folder" && opened_folders.includes(i)}
				<svelte:self
					path={[...path, name]}
					selected={selected
						.filter((x) => x[0] === name)
						.map((x) => x.slice(1))}
					{interactive}
					{ls_fn}
					{file_count}
					on:check
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
