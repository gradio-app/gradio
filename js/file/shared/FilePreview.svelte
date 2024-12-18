<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { prettyBytes } from "./utils";
	import { createEventDispatcher } from "svelte";
	import type { I18nFormatter, SelectData } from "@gradio/utils";
	import { DownloadLink } from "@gradio/wasm/svelte";

	const dispatch = createEventDispatcher<{
		select: SelectData;
		change: FileData[] | FileData;
		delete: FileData;
		download: FileData;
	}>();
	export let value: FileData | FileData[];
	export let selectable = false;
	export let height: number | string | undefined = undefined;
	export let i18n: I18nFormatter;
	export let allow_reordering = false;

	let dragging_index: number | null = null;
	let drop_target_index: number | null = null;

	function handle_drag_start(event: DragEvent, index: number): void {
		dragging_index = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData("text/plain", index.toString());
		}
	}

	function handle_drag_over(event: DragEvent, index: number): void {
		event.preventDefault();
		if (index === normalized_files.length - 1) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			const midY = rect.top + rect.height / 2;
			drop_target_index =
				event.clientY > midY ? normalized_files.length : index;
		} else {
			drop_target_index = index;
		}
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = "move";
		}
	}

	function handle_drag_end(event: DragEvent): void {
		if (
			!event.dataTransfer?.dropEffect ||
			event.dataTransfer.dropEffect === "none"
		) {
			dragging_index = null;
			drop_target_index = null;
		}
	}

	function handle_drop(event: DragEvent, index: number): void {
		event.preventDefault();
		if (dragging_index === null || dragging_index === index) return;

		const files = Array.isArray(value) ? [...value] : [value];
		const [removed] = files.splice(dragging_index, 1);
		files.splice(
			drop_target_index === normalized_files.length
				? normalized_files.length
				: index,
			0,
			removed
		);

		const new_value = Array.isArray(value) ? files : files[0];
		dispatch("change", new_value);

		dragging_index = null;
		drop_target_index = null;
	}

	function split_filename(filename: string): [string, string] {
		const last_dot = filename.lastIndexOf(".");
		if (last_dot === -1) {
			return [filename, ""];
		}
		return [filename.slice(0, last_dot), filename.slice(last_dot)];
	}

	$: normalized_files = (Array.isArray(value) ? value : [value]).map((file) => {
		const [filename_stem, filename_ext] = split_filename(file.orig_name ?? "");
		return {
			...file,
			filename_stem,
			filename_ext
		};
	});

	function handle_row_click(
		event: MouseEvent & { currentTarget: HTMLTableRowElement },
		index: number
	): void {
		const tr = event.currentTarget;
		const should_select =
			event.target === tr || // Only select if the click is on the row itself
			(tr &&
				tr.firstElementChild &&
				event.composedPath().includes(tr.firstElementChild)); // Or if the click is on the name column

		if (should_select) {
			dispatch("select", { value: normalized_files[index].orig_name, index });
		}
	}

	function remove_file(index: number): void {
		const removed = normalized_files.splice(index, 1);
		normalized_files = [...normalized_files];
		value = normalized_files;
		dispatch("delete", removed[0]);
		dispatch("change", normalized_files);
	}

	function handle_download(file: FileData): void {
		dispatch("download", file);
	}

	const is_browser = typeof window !== "undefined";
</script>

<div
	class="file-preview-holder"
	style:max-height={height
		? typeof height === "number"
			? height + "px"
			: height
		: "auto"}
>
	<table class="file-preview">
		<tbody>
			{#each normalized_files as file, i (file.url)}
				<tr
					class="file"
					class:selectable
					class:dragging={dragging_index === i}
					class:drop-target={drop_target_index === i ||
						(i === normalized_files.length - 1 &&
							drop_target_index === normalized_files.length)}
					data-drop-target={drop_target_index === normalized_files.length &&
					i === normalized_files.length - 1
						? "after"
						: drop_target_index === i + 1
							? "after"
							: "before"}
					draggable={allow_reordering && normalized_files.length > 1}
					on:click={(event) => {
						handle_row_click(event, i);
					}}
					on:dragstart={(event) => handle_drag_start(event, i)}
					on:dragenter|preventDefault
					on:dragover={(event) => handle_drag_over(event, i)}
					on:drop={(event) => handle_drop(event, i)}
					on:dragend={handle_drag_end}
				>
					<td class="filename" aria-label={file.orig_name}>
						{#if allow_reordering && normalized_files.length > 1}
							<span class="drag-handle">⋮⋮</span>
						{/if}
						<span class="stem">{file.filename_stem}</span>
						<span class="ext">{file.filename_ext}</span>
					</td>

					<td class="download">
						{#if file.url}
							<DownloadLink
								href={file.url}
								on:click={() => handle_download(file)}
								download={is_browser && window.__is_colab__
									? null
									: file.orig_name}
							>
								{@html file.size != null
									? prettyBytes(file.size)
									: "(size unknown)"}&nbsp;&#8675;
							</DownloadLink>
						{:else}
							{i18n("file.uploading")}
						{/if}
					</td>

					{#if normalized_files.length > 1}
						<td>
							<button
								class="label-clear-button"
								aria-label="Remove this file"
								on:click={() => {
									remove_file(i);
								}}
								on:keydown={(event) => {
									if (event.key === "Enter") {
										remove_file(i);
									}
								}}
								>×
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.label-clear-button {
		color: var(--body-text-color-subdued);
		position: relative;
		left: -3px;
	}

	.label-clear-button:hover {
		color: var(--body-text-color);
	}

	.file-preview {
		table-layout: fixed;
		width: var(--size-full);
		max-height: var(--size-60);
		overflow-y: auto;
		margin-top: var(--size-1);
		color: var(--body-text-color);
	}

	.file-preview-holder {
		overflow: auto;
	}

	.file {
		display: flex;
		width: var(--size-full);
	}

	.file > * {
		padding: var(--size-1) var(--size-2-5);
	}

	.filename {
		flex-grow: 1;
		display: flex;
		overflow: hidden;
	}
	.filename .stem {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.filename .ext {
		white-space: nowrap;
	}

	.download {
		min-width: 8rem;
		width: 10%;
		white-space: nowrap;
		text-align: right;
	}
	.download:hover {
		text-decoration: underline;
	}
	.download > :global(a) {
		color: var(--link-text-color);
	}

	.download > :global(a:hover) {
		color: var(--link-text-color-hover);
	}
	.download > :global(a:visited) {
		color: var(--link-text-color-visited);
	}
	.download > :global(a:active) {
		color: var(--link-text-color-active);
	}
	.selectable {
		cursor: pointer;
	}

	tbody > tr:nth-child(even) {
		background: var(--block-background-fill);
	}

	tbody > tr:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}

	.drag-handle {
		cursor: grab;
		color: var(--body-text-color-subdued);
		padding-right: var(--size-2);
		user-select: none;
	}

	.dragging {
		opacity: 0.5;
		cursor: grabbing;
	}

	.drop-target {
		border-top: 2px solid var(--color-accent);
	}

	tr:last-child.drop-target[data-drop-target="before"] {
		border-top: 2px solid var(--color-accent);
		border-bottom: none;
	}

	tr:last-child.drop-target[data-drop-target="after"] {
		border-top: none;
		border-bottom: 2px solid var(--color-accent);
	}
</style>
