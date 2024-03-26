<script lang="ts">
	import { createEventDispatcher, tick, getContext } from "svelte";
	import type { FileData } from "@gradio/client";
	import { upload_files, upload, prepare_files } from "@gradio/client";
	import { _ } from "svelte-i18n";
	import UploadProgress from "./UploadProgress.svelte";

	export let filetype: string | string[] | null = null;
	export let dragging = false;
	export let boundedheight = true;
	export let center = true;
	export let flex = true;
	export let file_count = "single";
	export let disable_click = false;
	export let root: string;
	export let hidden = false;
	export let format: "blob" | "file" = "file";
	export let uploading = false;
	export let hidden_upload: HTMLInputElement | null = null;

	let upload_id: string;
	let file_data: FileData[];
	let accept_file_types: string | null;

	// Needed for wasm support
	const upload_fn = getContext<typeof upload_files>("upload_files");

	const dispatch = createEventDispatcher();
	const validFileTypes = ["image", "video", "audio", "text", "file"];
	const processFileType = (type: string): string => {
		if (type.startsWith(".") || type.endsWith("/*")) {
			return type;
		}
		if (validFileTypes.includes(type)) {
			return type + "/*";
		}
		return "." + type;
	};

	$: if (filetype == null) {
		accept_file_types = null;
	} else if (typeof filetype === "string") {
		accept_file_types = processFileType(filetype);
	} else {
		filetype = filetype.map(processFileType);
		accept_file_types = filetype.join(", ");
	}

	function updateDragging(): void {
		dragging = !dragging;
	}

	export function paste_clipboard(): void {
		navigator.clipboard.read().then(async (items) => {
			for (let i = 0; i < items.length; i++) {
				const type = items[i].types.find((t) => t.startsWith("image/"));
				if (type) {
					items[i].getType(type).then(async (blob) => {
						const file = new File(
							[blob],
							`clipboard.${type.replace("image/", "")}`
						);
						await load_files([file]);
					});
					break;
				}
			}
		});
	}

	export function open_file_upload(): void {
		if (disable_click) return;
		if (hidden_upload) {
			hidden_upload.value = "";
			hidden_upload.click();
		}
	}

	async function handle_upload(
		file_data: FileData[]
	): Promise<(FileData | null)[]> {
		await tick();
		upload_id = Math.random().toString(36).substring(2, 15);
		uploading = true;
		const _file_data = await upload(file_data, root, upload_id, upload_fn);
		dispatch("load", file_count === "single" ? _file_data?.[0] : _file_data);
		uploading = false;
		return _file_data || [];
	}

	export async function load_files(
		files: File[] | Blob[]
	): Promise<(FileData | null)[] | void> {
		if (!files.length) {
			return;
		}
		let _files: File[] = files.map(
			(f) => new File([f], f.name, { type: f.type })
		);
		file_data = await prepare_files(_files);
		return await handle_upload(file_data);
	}

	async function load_files_from_upload(e: Event): Promise<void> {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;
		if (format != "blob") {
			await load_files(Array.from(target.files));
		} else {
			if (file_count === "single") {
				dispatch("load", target.files[0]);
				return;
			}
			dispatch("load", target.files);
		}
	}

	function is_valid_mimetype(
		file_accept: string | string[] | null,
		uploaded_file_extension: string,
		uploaded_file_type: string
	): boolean {
		if (
			!file_accept ||
			file_accept === "*" ||
			file_accept === "file/*" ||
			(Array.isArray(file_accept) &&
				file_accept.some((accept) => accept === "*" || accept === "file/*"))
		) {
			return true;
		}
		let acceptArray: string[];
		if (typeof file_accept === "string") {
			acceptArray = file_accept.split(",").map((s) => s.trim());
		} else if (Array.isArray(file_accept)) {
			acceptArray = file_accept;
		} else {
			return false;
		}
		return (
			acceptArray.includes(uploaded_file_extension) ||
			acceptArray.some((type) => {
				const [category] = type.split("/").map((s) => s.trim());
				return (
					type.endsWith("/*") && uploaded_file_type.startsWith(category + "/")
				);
			})
		);
	}

	async function loadFilesFromDrop(e: DragEvent): Promise<void> {
		dragging = false;
		if (!e.dataTransfer?.files) return;
		const files_to_load = Array.from(e.dataTransfer.files).filter((file) => {
			const file_extension = "." + file.name.split(".").pop();
			if (
				file_extension &&
				is_valid_mimetype(accept_file_types, file_extension, file.type)
			) {
				return true;
			}
			if (
				file_extension && Array.isArray(filetype)
					? filetype.includes(file_extension)
					: file_extension === filetype
			) {
				return true;
			}
			dispatch("error", `Invalid file type only ${filetype} allowed.`);
			return false;
		});
		await load_files(files_to_load);
	}
</script>

{#if filetype === "clipboard"}
	<button
		class:hidden
		class:center
		class:boundedheight
		class:flex
		style:height="100%"
		tabindex={hidden ? -1 : 0}
		on:click={paste_clipboard}
	>
		<slot />
	</button>
{:else if uploading && !hidden_upload}
	{#if !hidden}
		<UploadProgress {root} {upload_id} files={file_data} />
	{/if}
{:else}
	<button
		class:hidden
		class:center
		class:boundedheight
		class:flex
		class:disable_click
		style:height="100%"
		tabindex={hidden ? -1 : 0}
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
			aria-label="file upload"
			data-testid="file-upload"
			type="file"
			bind:this={hidden_upload}
			on:change={load_files_from_upload}
			accept={accept_file_types || undefined}
			multiple={file_count === "multiple" || undefined}
			webkitdirectory={file_count === "directory" || undefined}
			mozdirectory={file_count === "directory" || undefined}
		/>
	</button>
{/if}

<style>
	button {
		cursor: pointer;
		width: var(--size-full);
	}

	.hidden {
		display: none;
		height: 0 !important;
		position: absolute;
		width: 0;
		flex-grow: 0;
	}

	.center {
		display: flex;
		justify-content: center;
	}
	.flex {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.disable_click {
		cursor: default;
	}

	input {
		display: none;
	}
</style>
