<script lang="ts">
	interface FileData {
		name: string;
		size: number;
		data: string;
		is_example: false;
	}

	export let load: (
		val: Array<string | FileData> | string | FileData | null
	) => Array<string | FileData> | string | FileData | null;
	export let filetype: string | undefined = undefined;
	export let theme: string;
	export let file_count: "single" | "multiple" | "directory" = "single";
	export let include_file_metadata = true;
	let hidden_upload: HTMLInputElement;
	let dragging = false;

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
							data: this.result as string,
							is_example: false
					  }
					: (this.result as string);
				if (all_file_data.length === files.length) {
					load(file_count === "single" ? all_file_data[0] : all_file_data);
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
	class={dragging
		? "upload h-60 border-green-300 text-green-400 dark:text-green-500 dark:border-green-500 border-8 border-dashed w-full flex justify-center items-center text-3xl text-center cursor-pointer leading-10"
		: "upload h-60 border-gray-300 text-gray-400 dark:text-gray-500 dark:border-gray-500 border-8 border-dashed w-full flex justify-center items-center text-3xl text-center cursor-pointer leading-10"}
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

<style lang="postcss" global>
	.upload[theme="default"] {
		@apply transition hover:border-gray-400 hover:text-gray-500 dark:hover:border-gray-300 dark:hover:text-gray-300;
	}
</style>
