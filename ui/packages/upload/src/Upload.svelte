<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "./types";

	export let filetype: string | undefined = undefined;
	export let theme: string = "default";
	export let single_file: boolean = true;
	export let include_file_metadata = true;
	export let dragging = false;
	export let style: string = "";

	let hidden_upload: HTMLInputElement;
	let file_count: "multiple" | "directory" | "single";

	const dispatch = createEventDispatcher();

	const updateDragging = () => {
		dragging = !dragging;
	};

	const openFileUpload = () => {
		hidden_upload.click();
	};

	const loadFiles = (files: FileList) => {
		let _files: Array<File> = Array.from(files);
		if (!files.length || !window.FileReader) {
			return;
		}
		if (file_count === "single") {
			_files = [files[0]];
		}
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
				if (all_file_data.length === files.length) {
					dispatch("load", single_file ? all_file_data[0] : all_file_data);
				}
			};
		});
	};

	const loadFilesFromUpload = (e: Event) => {
		const target = e.target as HTMLInputElement;

		if (!target.files) return;
		loadFiles(target.files);
	};

	const loadFilesFromDrop = (e: DragEvent) => {
		dragging = false;
		if (!e.dataTransfer?.files) return;
		loadFiles(e.dataTransfer.files);
	};
</script>

<div
	class="w-full cursor-pointer h-full flex items-center justify-center text-center text-gray-400 md:text-xl max-h-[15rem] xl:max-h-[18rem] 2xl:max-h-[20rem] min-h-[10rem] md:min-h-[15rem]"
	{theme}
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
		class="hidden-upload hidden"
		type="file"
		bind:this={hidden_upload}
		on:change={loadFilesFromUpload}
		accept={filetype}
		multiple={file_count === "multiple" || undefined}
		webkitdirectory={file_count === "directory" || undefined}
		mozdirectory={file_count === "directory" || undefined}
	/>
</div>
