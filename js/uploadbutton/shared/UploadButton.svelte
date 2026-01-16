<script lang="ts">
	import { tick } from "svelte";
	import { BaseButton } from "@gradio/button";
	import { prepare_files, type FileData, type Client } from "@gradio/client";

	let {
		elem_id = "",
		elem_classes = [],
		visible = true,
		label,
		value,
		file_count,
		file_types = [],
		root,
		size = "lg",
		icon = null,
		scale = null,
		min_width = undefined,
		variant = "secondary",
		disabled = false,
		max_file_size = null,
		upload,
		onclick,
		onchange,
		onupload,
		onerror,
		children
	}: {
		elem_id?: string;
		elem_classes?: string[];
		visible?: boolean | "hidden";
		label: string | null;
		value?: null | FileData | FileData[];
		file_count: string;
		file_types?: string[];
		root: string;
		size?: "sm" | "md" | "lg";
		icon?: FileData | null;
		scale?: number | null;
		min_width?: number | undefined;
		variant?: "primary" | "secondary" | "stop";
		disabled?: boolean;
		max_file_size?: number | null;
		upload: Client["upload"];
		onclick?: () => void;
		onchange?: (value: null | FileData | FileData[]) => void;
		onupload?: (value: null | FileData | FileData[]) => void;
		onerror?: (message: string) => void;
		children?: import("svelte").Snippet;
	} = $props();

	let hidden_upload: HTMLInputElement;

	let accept_file_types = $derived.by(() => {
		if (file_types == null) {
			return null;
		}
		const mapped = file_types.map((x) => {
			if (x.startsWith(".")) {
				return x;
			}
			return x + "/*";
		});
		return mapped.join(", ");
	});

	function open_file_upload(): void {
		onclick?.();
		hidden_upload.click();
	}

	async function load_files(files: FileList): Promise<void> {
		let _files: File[] = Array.from(files);

		if (!files.length) {
			return;
		}
		if (file_count === "single") {
			_files = [files[0]];
		}
		let all_file_data = await prepare_files(_files);
		await tick();

		try {
			all_file_data = (
				await upload(all_file_data, root, undefined, max_file_size ?? Infinity)
			)?.filter((x) => x !== null) as FileData[];
		} catch (e) {
			onerror?.((e as Error).message);
			return;
		}
		const new_value =
			file_count === "single" ? all_file_data?.[0] : all_file_data;
		onchange?.(new_value);
		onupload?.(new_value);
	}

	async function load_files_from_upload(e: Event): Promise<void> {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		await load_files(target.files);
	}

	function clear_input_value(e: Event): void {
		const target = e.target as HTMLInputElement;
		if (target.value) target.value = "";
	}
</script>

<input
	class="hide"
	accept={accept_file_types}
	type="file"
	bind:this={hidden_upload}
	onchange={load_files_from_upload}
	onclick={clear_input_value}
	multiple={file_count === "multiple" || undefined}
	webkitdirectory={file_count === "directory" || undefined}
	mozdirectory={file_count === "directory" || undefined}
	data-testid="{label}-upload-button"
/>

<BaseButton
	{size}
	{variant}
	{elem_id}
	{elem_classes}
	{visible}
	onclick={open_file_upload}
	{scale}
	{min_width}
	{disabled}
>
	{#if icon}
		<img class="button-icon" src={icon.url} alt={`${value} icon`} />
	{/if}
	{#if children}{@render children()}{/if}
</BaseButton>

<style>
	.hide {
		display: none;
	}
	.button-icon {
		width: var(--text-xl);
		height: var(--text-xl);
		margin-right: var(--spacing-xl);
	}
</style>
