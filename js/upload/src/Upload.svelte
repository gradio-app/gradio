<script lang="ts">
	import { createEventDispatcher, tick, getContext } from "svelte";
	import type { FileData } from "@gradio/client";
	import { prepare_files, type Client } from "@gradio/client";
	import { _ } from "svelte-i18n";
	import UploadProgress from "./UploadProgress.svelte";
	import { create_drag } from "./utils";

	const { drag, open_file_upload: _open_file_upload } = create_drag();

	export let filetype: string | string[] | null = null;
	export let dragging = false;
	export let boundedheight = true;
	export let center = true;
	export let flex = true;
	export let file_count: "single" | "multiple" | "directory" = "single";
	export let disable_click = false;
	export let root: string;
	export let hidden = false;
	export let format: "blob" | "file" = "file";
	export let uploading = false;
	export let show_progress = true;
	export let max_file_size: number | null = null;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let icon_upload = false;
	export let height: number | string | undefined = undefined;
	export let aria_label: string | undefined = undefined;
	export function open_upload(): void {
		_open_file_upload();
	}
	let upload_id: string;
	let file_data: FileData[];
	let accept_file_types: string | null;
	let use_post_upload_validation: boolean | null = null;

	const get_ios = (): boolean => {
		if (typeof navigator !== "undefined") {
			const userAgent = navigator.userAgent.toLowerCase();
			return userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipad") > -1;
		}
		return false;
	};

	$: ios = get_ios();

	const dispatch = createEventDispatcher();
	const validFileTypes = ["image", "video", "audio", "text", "file"];
	const process_file_type = (type: string): string => {
		if (ios && type.startsWith(".")) {
			use_post_upload_validation = true;
			return type;
		}
		if (ios && type.includes("file/*")) {
			return "*";
		}
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
		accept_file_types = process_file_type(filetype);
	} else if (ios && filetype.includes("file/*")) {
		accept_file_types = "*";
	} else {
		filetype = filetype.map(process_file_type);
		accept_file_types = filetype.join(", ");
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
		_open_file_upload();
	}

	async function handle_upload(
		file_data: FileData[]
	): Promise<(FileData | null)[]> {
		await tick();
		upload_id = Math.random().toString(36).substring(2, 15);
		uploading = true;
		try {
			const _file_data = await upload(
				file_data,
				root,
				upload_id,
				max_file_size ?? Infinity
			);
			dispatch("load", file_count === "single" ? _file_data?.[0] : _file_data);
			uploading = false;
			return _file_data || [];
		} catch (e) {
			dispatch("error", (e as Error).message);
			uploading = false;
			return [];
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

	export async function load_files(
		files: File[] | Blob[]
	): Promise<(FileData | null)[] | void> {
		if (!files.length) {
			return;
		}
		let _files: File[] = files.map(
			(f) =>
				new File([f], f instanceof File ? f.name : "file", { type: f.type })
		);

		if (ios && use_post_upload_validation) {
			_files = _files.filter((file) => {
				if (is_valid_file(file)) {
					return true;
				}
				dispatch(
					"error",
					`Invalid file type: ${file.name}. Only ${filetype} allowed.`
				);
				return false;
			});

			if (_files.length === 0) {
				return [];
			}
		}

		file_data = await prepare_files(_files);
		return await handle_upload(file_data);
	}

	function is_valid_file(file: File): boolean {
		if (!filetype) return true;

		const allowed_types = Array.isArray(filetype) ? filetype : [filetype];

		return allowed_types.some((type) => {
			const processed_type = process_file_type(type);

			if (processed_type.startsWith(".")) {
				return file.name.toLowerCase().endsWith(processed_type.toLowerCase());
			}

			if (processed_type === "*") {
				return true;
			}

			if (processed_type.endsWith("/*")) {
				const [category] = processed_type.split("/");
				return file.type.startsWith(category + "/");
			}

			return file.type === processed_type;
		});
	}

	async function load_files_from_upload(files: File[]): Promise<void> {
		const files_to_load = files.filter((file) => {
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

		if (format != "blob") {
			await load_files(files_to_load);
		} else {
			if (file_count === "single") {
				dispatch("load", files_to_load[0]);
				return;
			}
			dispatch("load", files_to_load);
		}
	}

	export async function load_files_from_drop(e: DragEvent): Promise<void> {
		dragging = false;
		if (!e.dataTransfer?.files) return;
		const files_to_load = Array.from(e.dataTransfer.files).filter(
			is_valid_file
		);

		if (format != "blob") {
			await load_files(files_to_load);
		} else {
			if (file_count === "single") {
				dispatch("load", files_to_load[0]);
				return;
			}
			dispatch("load", files_to_load);
		}
	}
</script>

{#if filetype === "clipboard"}
	<button
		class:hidden
		class:center
		class:boundedheight
		class:flex
		class:icon-mode={icon_upload}
		style:height={icon_upload
			? ""
			: height
				? typeof height === "number"
					? height + "px"
					: height
				: "100%"}
		tabindex={hidden ? -1 : 0}
		on:click={paste_clipboard}
		aria-label={aria_label || "Paste from clipboard"}
	>
		<slot />
	</button>
{:else if uploading && show_progress}
	{#if !hidden}
		<UploadProgress {root} {upload_id} files={file_data} {stream_handler} />
	{/if}
{:else}
	<button
		class:hidden
		class:center
		class:boundedheight
		class:flex
		class:disable_click
		class:icon-mode={icon_upload}
		style:height={icon_upload
			? ""
			: height
				? typeof height === "number"
					? height + "px"
					: height
				: "100%"}
		tabindex={hidden ? -1 : 0}
		use:drag={{
			on_drag_change: (dragging) => (dragging = dragging),
			on_files: (files) => load_files_from_upload(files),
			accepted_types: accept_file_types,
			mode: file_count,
			disable_click
		}}
		aria-label={aria_label || "Click to upload or drop files"}
		aria-dropeffect="copy"
	>
		<slot />
	</button>
{/if}

<style>
	button {
		cursor: pointer;
		width: var(--size-full);
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
	.hidden {
		display: none;
		position: absolute;
		flex-grow: 0;
	}

	.hidden :global(svg) {
		display: none;
	}

	.disable_click {
		cursor: default;
	}

	.icon-mode {
		position: absolute !important;
		width: var(--size-4);
		height: var(--size-4);
		padding: 0;
		min-height: 0;
		border-radius: var(--radius-circle);
	}

	.icon-mode :global(svg) {
		width: var(--size-4);
		height: var(--size-4);
	}
</style>
