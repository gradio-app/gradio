<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "./types";

	import video_icon from "./video.svg";
	import audio_icon from "./music.svg";
	import file_icon from "./file.svg";
	import csv_icon from "./table.svg";
	import image_icon from "./image.svg";

	export let filetype: string | undefined = undefined;
	export let theme: string = "default";
	export let single_file: boolean = true;
	export let include_file_metadata = true;
	export let label: string | null = null;

	const type_labels = {
		"audio/*": { text: "Audio", icon: audio_icon },
		file: { text: "File", icon: file_icon },
		"image/x-png,image/gif,image/jpeg": { text: "Image", icon: image_icon },
		"text/csv": { text: "CSV", icon: csv_icon },
		"video/mp4,video/x-m4v,video/*": { text: "Video", icon: video_icon }
	} as const;

	if (!label && label !== "" && filetype) {
		label = type_labels[filetype as keyof typeof type_labels].text;
	}

	let hidden_upload: HTMLInputElement;
	let dragging = false;
	let file_count;

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
		if (!e.dataTransfer?.files) return;
		loadFiles(e.dataTransfer.files);
	};
</script>

<div
	class="{dragging
		? `border-green-400`
		: ``} w-full h-full flex items-center justify-center text-center text-gray-400 md:text-xl relative border-gray-200 max-h-[15rem] xl:max-h-[18rem] 2xl:max-h-[20rem] border-[2px] min-h-[10rem] md:min-h-[15rem] border-dashed bg-white shadow-sm rounded-xl cursor-pointer overflow-hidden"
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
	{#if label}
		<div
			class="absolute left-0 top-0 py-1 px-2 rounded-br-lg shadow-sm text-xs text-gray-500 flex items-center pointer-events-none bg-white/90 z-10"
		>
			<img
				src={type_labels[filetype].icon}
				alt=""
				class="mr-2 h-[12px] w-[12px] opacity-50"
			/>
			{label}
		</div>
	{/if}
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
