<script lang="ts">
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "./types";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let size: "sm" | "lg" = "lg";
	export let filetype: "image" | "video" | "audio" | "text" | "file" = "file";
	export let include_file_metadata = true;

	$: ({ classes } = get_styles(style, ["full_width"]));

	let hidden_upload: HTMLInputElement;
	const dispatch = createEventDispatcher();

	const openFileUpload = () => {
		hidden_upload.click();
	};

	const loadFiles = (files: FileList) => {
		let _files: Array<File> = Array.from(files);
		if (!files.length || !window.FileReader) {
			return;
		}
		_files = [files[0]];
		var all_file_data: Array<FileData | string> = [];
		_files.forEach((f, i) => {
			let ReaderObj = new FileReader();
			ReaderObj.readAsDataURL(f);
			ReaderObj.onloadend = function () {
				all_file_data[i] = include_file_metadata
					? {
							name: f.name,
							size: f.size,
							data: this.result as string
					  }
					: (this.result as string);
				if (
					all_file_data.filter((x) => x !== undefined).length === files.length
				) {
					dispatch(
						"load",
						all_file_data[0]
					);
				}
			};
		});
	};

	const loadFilesFromUpload = (e: Event) => {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		loadFiles(target.files);
	};
</script>

<input
		class="hidden-upload hidden"
		accept={filetype + "/*"}
		type="file"
		bind:this={hidden_upload}
		on:change={loadFilesFromUpload}
	/>

<button
	on:click={openFileUpload}
	class:!hidden={!visible}
	class="gr-button gr-button-{size}
		{classes}"
	id={elem_id}
>
	<slot />
</button>
