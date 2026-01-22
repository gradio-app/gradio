<script lang="ts">
	import type { FileNode } from "./types";
	import type { SelectData } from "@gradio/utils";

	import Arrow from "./ArrowIcon.svelte";
	import Checkbox from "./Checkbox.svelte";
	import Self from "./FileTree.svelte";
	import FileIcon from "../icons/light-file.svg";
	import FolderIcon from "../icons/light-folder.svg";

	interface Props {
		path?: string[];
		index_path?: number[];
		selected_files?: string[][];
		selected_folders?: string[][];
		is_selected_entirely?: boolean;
		interactive: boolean;
		selectable?: boolean;
		ls_fn: (path: string[]) => Promise<FileNode[]>;
		file_count?: "single" | "multiple";
		valid_for_selection: boolean;
		oncheck?: (detail: { path: string[]; checked: boolean; type: "file" | "folder" }) => void;
		onselect?: (detail: SelectData) => void;
	}

	let {
		path = [],
		index_path = [],
		selected_files = [],
		selected_folders = [],
		is_selected_entirely = false,
		interactive,
		selectable = false,
		ls_fn,
		file_count = "multiple",
		valid_for_selection,
		oncheck,
		onselect
	}: Props = $props();

	let content = $state<FileNode[]>([]);
	let opened_folders = $state<number[]>([]);

	const toggle_open_folder = (i: number): void => {
		if (opened_folders.includes(i)) {
			opened_folders = opened_folders.filter((x) => x !== i);
		} else {
			opened_folders = [...opened_folders, i];
		}
	};

	const open_folder = (i: number): void => {
		if (!opened_folders.includes(i)) {
			opened_folders = [...opened_folders, i];
		}
	};

	(async () => {
		content = await ls_fn(path);
		if (valid_for_selection) {
			content = [{ name: ".", type: "file" }, ...content];
		}
		opened_folders = content
			.map((x, i) =>
				x.type === "folder" &&
				(is_selected_entirely || selected_files.some((y) => y[0] === x.name))
					? i
					: null
			)
			.filter((x): x is number => x !== null);
	})();

	$effect(() => {
		if (is_selected_entirely) {
			content.forEach((x) => {
				oncheck?.({
					path: [...path, x.name],
					checked: true,
					type: x.type
				});
			});
		}
	});

	function handle_select(
		full_index_path: number[],
		item_path: string[],
		_type: "file" | "folder"
	): void {
		onselect?.({
			index: full_index_path as any,
			value: item_path.join("/"),
			selected: true
		});
	}
</script>

<ul class:no-checkboxes={!interactive} class:root={path.length === 0}>
	{#each content as { type, name, valid }, i}
		{@const is_selected = (
			type === "file" ? selected_files : selected_folders
		).some((x) => x[0] === name && x.length === 1)}
		<li>
			<span
				class="wrap"
				class:selected={!interactive && is_selected}
				class:selectable
				role={selectable ? "button" : undefined}
				tabindex={selectable ? 0 : undefined}
				onclick={(e) => {
					e.stopPropagation();
					if (selectable) {
						handle_select([...index_path, i], [...path, name], type);
					}
				}}
				onkeydown={(e) => {
					if (selectable && (e.key === " " || e.key === "Enter")) {
						handle_select([...index_path, i], [...path, name], type);
					}
				}}
			>
				{#if interactive}
					{#if type === "folder" && file_count === "single"}
						<span class="no-checkbox" aria-hidden="true"></span>
					{:else}
						<Checkbox
							disabled={false}
							value={is_selected}
							onchange={(checked) => {
								oncheck?.({
									path: [...path, name],
									checked,
									type
								});
								if (selectable) {
									handle_select([...index_path, i], [...path, name], type);
								}
								if (type === "folder" && checked) {
									open_folder(i);
								}
							}}
						/>
					{/if}
				{/if}

				{#if type === "folder"}
					<span
						class="icon"
						class:hidden={!opened_folders.includes(i)}
						onclick={(e) => {
							e.stopPropagation();
							toggle_open_folder(i);
						}}
						role="button"
						aria-label="expand directory"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === " " || e.key === "Enter") {
								toggle_open_folder(i);
							}
						}}><Arrow /></span
					>
				{:else}
					<span class="file-icon">
						<img src={name === "." ? FolderIcon : FileIcon} alt="file icon" />
					</span>
				{/if}
				<span class="item-name">{name}</span>
			</span>
			{#if type === "folder" && opened_folders.includes(i)}
				<Self
					path={[...path, name]}
					index_path={[...index_path, i]}
					selected_files={selected_files
						.filter((x) => x[0] === name)
						.map((x) => x.slice(1))}
					selected_folders={selected_folders
						.filter((x) => x[0] === name)
						.map((x) => x.slice(1))}
					is_selected_entirely={selected_folders.some(
						(x) => x[0] === name && x.length === 1
					)}
					{interactive}
					{selectable}
					{ls_fn}
					{file_count}
					valid_for_selection={valid ?? false}
					{oncheck}
					{onselect}
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

	.no-checkbox {
		width: 18px;
		height: 18px;
	}

	ul.root .no-checkbox {
		display: none;
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

	ul.root {
		margin-left: 8px;
	}

	ul.no-checkboxes:not(.root) {
		margin-left: 20px;
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

	.wrap.selected {
		background-color: var(--color-accent-soft);
		border-radius: var(--radius-sm);
		margin-left: -4px;
		padding-left: 4px;
	}

	.wrap.selectable {
		cursor: pointer;
		border-radius: var(--radius-sm);
		margin-left: -4px;
		padding-left: 4px;
		padding-right: 4px;
	}

	.wrap.selectable:hover {
		background-color: var(--border-color-accent);
	}

	.item-name {
		flex: 1;
		padding: 2px 4px;
		border-radius: var(--radius-sm);
		margin-right: -4px;
	}
</style>
