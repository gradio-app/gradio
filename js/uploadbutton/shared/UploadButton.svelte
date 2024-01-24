<script lang="ts">
	import { tick, createEventDispatcher, getContext } from "svelte";
	import { BaseButton } from "@gradio/button";
	import {
		upload,
		prepare_files,
		type FileData,
		get_fetchable_url_or_file,
		type upload_files
	} from "@gradio/client";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label: string | null;
	export let value: null | FileData | FileData[];
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
	export let size: "sm" | "lg" = "lg";
	export let icon: string | null = null;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let disabled = false;
	export let proxy_url: string | null = null;
	$: icon_path = get_fetchable_url_or_file(icon, root, proxy_url);

	const dispatch = createEventDispatcher();

	// Needed for wasm support
	const upload_fn = getContext<typeof upload_files>("upload_files");

	let hidden_upload: HTMLInputElement;
	let accept_file_types: string | null;

	if (file_types == null) {
		accept_file_types = null;
	} else {
		file_types = file_types.map((x) => {
			if (x.startsWith(".")) {
				return x;
			}
			return x + "/*";
		});
		accept_file_types = file_types.join(", ");
	}

	function openFileUpload(): void {
		dispatch("click");
		hidden_upload.click();
	}

	async function loadFiles(files: FileList): Promise<void> {
		let _files: File[] = Array.from(files);
		if (!files.length) {
			return;
		}
		if (file_count === "single") {
			_files = [files[0]];
		}
		let all_file_data = await prepare_files(_files);
		await tick();

		all_file_data = (
			await upload(all_file_data, root, undefined, upload_fn)
		)?.filter((x) => x !== null) as FileData[];
		value = file_count === "single" ? all_file_data?.[0] : all_file_data;
		dispatch("change", value);
		dispatch("upload", value);
	}

	async function loadFilesFromUpload(e: Event): Promise<void> {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		await loadFiles(target.files);
	}

	function clearInputValue(e: Event): void {
		const target = e.target as HTMLInputElement;
		if (target.value) target.value = "";
	}
</script>

<input
	class="hide"
	accept={accept_file_types}
	type="file"
	bind:this={hidden_upload}
	on:change={loadFilesFromUpload}
	on:click={clearInputValue}
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
	on:click={openFileUpload}
	{scale}
	{min_width}
	{disabled}
>
	{#if icon}
		<img class="button-icon" src={icon_path} alt={`${value} icon`} />
	{/if}
	<slot />
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
