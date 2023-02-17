<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "./types";
	import { blobToBase64 } from "./utils";

	export let filetype: string | null = null;
	export let include_file_metadata = true;
	export let dragging = false;
	export let boundedheight: boolean = true;
	export let center: boolean = true;
	export let flex: boolean = true;
	export let file_count: string = "single";
	export let disable_click = false;
	export let parse_to_data_url = true;

	let hidden_upload: HTMLInputElement;

	const dispatch = createEventDispatcher();

	const updateDragging = () => {
		dragging = !dragging;
	};

	const openFileUpload = () => {
		if (disable_click) return;
		hidden_upload.value = "";
		hidden_upload.click();
	};

	const loadFiles = async (files: FileList) => {
		let _files: Array<File> = Array.from(files);
		if (!files.length || !window.FileReader) {
			return;
		}
		if (file_count === "single") {
			_files = [files[0]];
		}

		if (include_file_metadata) {
			var file_metadata: Array<{ name: string; size: number }> = _files.map(
				(f) => ({
					name: f.name,
					size: f.size
				})
			);
		}
		var load_file_data = [];
		var file_data: Array<string> | Array<File> = [];
		if (parse_to_data_url) {
			file_data = await Promise.all(_files.map((f) => blobToBase64(f)));
		} else {
			file_data = _files;
		}
		if (include_file_metadata) {
			if (parse_to_data_url) {
				load_file_data = file_data.map((data, i) => ({
					data,
					...file_metadata[i]
				}));
			} else {
				load_file_data = file_data.map((data, i) => ({
					data: "",
					blob: data,
					...file_metadata[i]
				}));
			}
		} else {
			load_file_data = file_data;
		}
		dispatch(
			"load",
			file_count === "single" ? load_file_data[0] : load_file_data
		);
	};

	const loadFilesFromUpload = async (e: Event) => {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		await loadFiles(target.files);
	};

	const loadFilesFromDrop = async (e: DragEvent) => {
		dragging = false;
		if (!e.dataTransfer?.files) return;
		await loadFiles(e.dataTransfer.files);
	};
</script>

<div
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
</div>

<style>
	div {
		cursor: pointer;
		width: var(--size-full);
		height: var(--size-full);
	}

	.center {
		text-align: center;
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
