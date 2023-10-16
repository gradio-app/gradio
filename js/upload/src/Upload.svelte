<script lang="ts">
	import { createEventDispatcher, tick, getContext } from "svelte";
	import type { FileData } from "./types";
	import { blobToBase64, normalise_file } from "./utils";
	import { upload_files as default_upload_files } from "@gradio/client";

	const upload_files =
		getContext<typeof default_upload_files>("upload_files") ??
		default_upload_files;

	export let filetype: string | null = null;
	export let dragging = false;
	export let boundedheight = true;
	export let center = true;
	export let flex = true;
	export let file_count = "single";
	export let disable_click = false;
	export let root: string;

	let hidden_upload: HTMLInputElement;

	const dispatch = createEventDispatcher();

	function updateDragging(): void {
		dragging = !dragging;
	}

	function openFileUpload(): void {
		if (disable_click) return;
		hidden_upload.value = "";
		hidden_upload.click();
	}

	async function handle_upload(file_data: FileData[]): Promise<void> {
		await tick();
		let files = (Array.isArray(file_data) ? file_data : [file_data]).map(
			(file_data) => file_data.blob!
		);

		await upload_files(root, files).then(async (response) => {
			if (response.error) {
				(Array.isArray(file_data) ? file_data : [file_data]).forEach(
					async (file_data, i) => {
						file_data.data = await blobToBase64(file_data.blob!);
						file_data.blob = undefined;
					}
				);
			} else {
				(Array.isArray(file_data) ? file_data : [file_data]).forEach((f, i) => {
					if (response.files) {
						f.orig_name = f.name;
						f.name = response.files[i];
						f.is_file = true;
						f.blob = undefined;
						normalise_file(f, root, null);
					}
				});
			}
		});
		dispatch("load", file_count === "single" ? file_data[0] : file_data);
	}

	async function loadFiles(files: FileList): Promise<void> {
		let _files: File[] = Array.from(files);
		if (!files.length) {
			return;
		}
		if (file_count === "single") {
			_files = [files[0]];
		}
		var all_file_data: FileData[] = [];
		_files.forEach((f, i) => {
			all_file_data[i] = {
				name: f.name,
				size: f.size,
				data: "",
				blob: f
			};
		});
		await handle_upload(all_file_data);
	}

	async function loadFilesFromUpload(e: Event): Promise<void> {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		await loadFiles(target.files);
	}

	async function loadFilesFromDrop(e: DragEvent): Promise<void> {
		dragging = false;
		if (!e.dataTransfer?.files) return;
		await loadFiles(e.dataTransfer.files);
	}
</script>

<button
	class:center
	class:boundedheight
	class:flex
	on:drag|preventDefault|stopPropagation
	on:dragstart|preventDefault|stopPropagation
	on:dragend|preventDefault|stopPropagation
	on:dragover|preventDefault|stopPropagation
	on:dragenter|preventDefault|stopPropagation
	on:dragleave|preventDefault|stopPropagation
	on:drop|preventDefault|stopPropagation
	on:click={openFileUpload}
	on:drop={loadFilesFromDrop}
	on:dragenter={updateDragging}
	on:dragleave={updateDragging}
>
	<slot />
	<input
		type="file"
		bind:this={hidden_upload}
		on:change={loadFilesFromUpload}
		accept={filetype}
		multiple={file_count === "multiple" || undefined}
		webkitdirectory={file_count === "directory" || undefined}
		mozdirectory={file_count === "directory" || undefined}
	/>
</button>

<style>
	button {
		cursor: pointer;
		width: var(--size-full);
		height: var(--size-full);
	}

	.center {
		display: flex;
		justify-content: center;
	}
	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	input {
		display: none;
	}
</style>
