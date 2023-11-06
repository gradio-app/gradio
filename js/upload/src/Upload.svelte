<script lang="ts">
	import { createEventDispatcher, tick, getContext } from "svelte";
	import type { FileData } from "@gradio/client";
	import { upload_files, upload, prepare_files } from "@gradio/client";
	import { _ } from "svelte-i18n";

	export let filetype: string | null = null;
	export let dragging = false;
	export let boundedheight = true;
	export let center = true;
	export let flex = true;
	export let file_count = "single";
	export let disable_click = false;
	export let root: string;
	export let hidden = false;
	export let include_sources = false;

	// Needed for wasm support
	const upload_fn = getContext<typeof upload_files>("upload_files");

	let hidden_upload: HTMLInputElement;

	const dispatch = createEventDispatcher();

	function updateDragging(): void {
		dragging = !dragging;
	}

	export function open_file_upload(): void {
		if (disable_click) return;
		hidden_upload.value = "";
		hidden_upload.click();
	}

	async function handle_upload(
		file_data: FileData[]
	): Promise<(FileData | null)[]> {
		await tick();
		const _file_data = await upload(file_data, root, upload_fn);
		dispatch("load", file_count === "single" ? _file_data?.[0] : _file_data);
		return _file_data || [];
	}

	export async function load_files(
		files: File[] | Blob[]
	): Promise<(FileData | null)[] | void> {
		if (!files.length) {
			return;
		}
		let _files: File[] = files.map((f) => new File([f], f.name));
		let file_data = await prepare_files(_files);
		return await handle_upload(file_data);
	}

	async function load_files_from_upload(e: Event): Promise<void> {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;
		await load_files(Array.from(target.files));
	}

	function is_valid_mimetype(
		file_accept: string | null,
		mime_type: string
	): boolean {
		if (!file_accept) {
			return true;
		}
		if (file_accept === "*") {
			return true;
		}
		if (file_accept.endsWith("/*")) {
			return mime_type.startsWith(file_accept.slice(0, -1));
		}
		return file_accept === mime_type;
	}

	async function loadFilesFromDrop(e: DragEvent): Promise<void> {
		dragging = false;
		if (!e.dataTransfer?.files) return;

		const files_to_load = Array.from(e.dataTransfer.files).filter((f) => {
			if (filetype?.split(",").some((m) => is_valid_mimetype(m, f.type))) {
				return true;
			}
			dispatch("error", `Invalid file type only ${filetype} allowed.`);
			return false;
		});

		await load_files(files_to_load);
	}
</script>

<button
	class:hidden
	class:center
	class:boundedheight
	class:flex
	style:height={include_sources ? "calc(100% - 40px" : "100%"}
	on:drag|preventDefault|stopPropagation
	on:dragstart|preventDefault|stopPropagation
	on:dragend|preventDefault|stopPropagation
	on:dragover|preventDefault|stopPropagation
	on:dragenter|preventDefault|stopPropagation
	on:dragleave|preventDefault|stopPropagation
	on:drop|preventDefault|stopPropagation
	on:click={open_file_upload}
	on:drop={loadFilesFromDrop}
	on:dragenter={updateDragging}
	on:dragleave={updateDragging}
>
	<slot />
	<input
		type="file"
		bind:this={hidden_upload}
		on:change={load_files_from_upload}
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
	}

	.hidden {
		display: none;
		height: 0;
		position: absolute;
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
