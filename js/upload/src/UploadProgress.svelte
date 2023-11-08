<script lang="ts">
	import { FileData } from "@gradio/client";
	import { onMount, createEventDispatcher } from "svelte";

	type FileDataWithProgress = FileData & { progress: number };

	export let upload_id: string;
	export let root: string;
	export let files: FileData[];

	let event_source: EventSource;
	let progress = false;

	let files_with_progress: FileDataWithProgress[] = files.map((file) => {
		return {
			...file,
			progress: 0,
		};
	});

	let lowestProgressFile: FileData | null = "";

	const dispatch = createEventDispatcher();

	function handleProgress(filename: string, chunk_size: number): void {
		// Find the corresponding file in the array and update its progress
		files_with_progress = files_with_progress.map((file) => {
			if (file.orig_name === filename) {
				file.progress += chunk_size;
			}
			return file;
		});
	}

	function getProgress(file: FileDataWithProgress): number {
		return (file.progress * 100) / (file.size || 0) || 0;
	}

	onMount(() => {
		event_source = new EventSource(
			`${root}/upload_progress?upload_id=${upload_id}`
		);
		// Event listener for progress updates
		event_source.onmessage = async function (event) {
			const _data = JSON.parse(event.data);
			if (!progress) progress = true;
			if (_data.msg === "done") {
				event_source.close();
				dispatch("done");
			} else {
				handleProgress(_data.orig_name, _data.chunk_size);
			}
		};
	});

	function calculateTotalProgress(files: FileData[]): string {
		let totalProgress = 0;
		files.forEach((file) => {
			totalProgress += getProgress(file as FileDataWithProgress);
		});

		document.documentElement.style.setProperty(
			"--upload-progress-width",
			(totalProgress / files.length).toFixed(2) + "%"
		);

		document.documentElement.style.setProperty(
			"--upload-progress",
			(totalProgress / files.length).toFixed(2)
		);

		files.forEach((file) => {
			if (
				getProgress(file as FileDataWithProgress) <
				getProgress(lowestProgressFile as FileDataWithProgress)
			) {
				lowestProgressFile = file;
			}
		});

		return (totalProgress / files.length).toFixed(2);
	}

	$: calculateTotalProgress(files_with_progress);
</script>

<div class="wrap" class:progress>
	<span class="file-wrap">
		<div class="file-info">
			<span>Uploading {files_with_progress.length} files...</span>
		</div>
		{#if lowestProgressFile}
			<div class="file-name">
				{lowestProgressFile.orig_name}
			</div>
		{/if}
	</span>
</div>

<style>
	.wrap {
		overflow-y: auto;
		transition: opacity 0.5s ease-in-out;
		background: var(--block-background-fill);
		min-height: var(--size-40);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wrap::after {
		content: "";
		top: 0;
		left: 0;
		position: absolute;
		background: var(--background-fill-primary);
		width: var(--upload-progress-width, 0%);
		height: 100%;
		z-index: 1;
	}

	.wrap.progress {
		opacity: 1;
	}

	.file-info {
		height: 100%;
		justify-content: center;
		text-align: center;
		width: 100%;
		z-index: 2;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.file-info > span {
		color: var(--body-text-color);
		font-size: var(--text-lg);
		font-family: var(--font);
		margin: var(--spacing-lg);
	}

	.file-name {
		color: var(--body-text-color-subdued);
		font-size: var(--text-lg);
		font-family: var(--font);
		margin: var(--spacing-lg);
		z-index: 2;
		position: relative;
	}
</style>
