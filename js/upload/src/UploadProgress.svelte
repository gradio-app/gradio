<script lang="ts">
	import { FileData, type Client } from "@gradio/client";
	import { onMount, createEventDispatcher, onDestroy } from "svelte";

	type FileDataWithProgress = FileData & { progress: number };

	export let upload_id: string;
	export let root: string;
	export let files: FileData[];
	export let stream_handler: Client["stream"];

	let stream: Awaited<ReturnType<Client["stream"]>>;
	let progress = false;
	let current_file_upload: FileDataWithProgress;
	let file_to_display: FileDataWithProgress;

	let files_with_progress: FileDataWithProgress[] = files.map((file) => {
		return {
			...file,
			progress: 0
		};
	});

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

	onMount(async () => {
		stream = await stream_handler(
			new URL(`${root}/upload_progress?upload_id=${upload_id}`)
		);

		if (stream == null) {
			throw new Error("Event source is not defined");
		}
		// Event listener for progress updates
		stream.onmessage = async function (event) {
			const _data = JSON.parse(event.data);
			if (!progress) progress = true;
			if (_data.msg === "done") {
				// the stream will close itself but is here for clarity; remove .close() in 5.0
				stream?.close();
				dispatch("done");
			} else {
				current_file_upload = _data;
				handleProgress(_data.orig_name, _data.chunk_size);
			}
		};
	});
	onDestroy(() => {
		// the stream will close itself but is here for clarity; remove .close() in 5.0
		if (stream != null || stream != undefined) stream.close();
	});

	function calculateTotalProgress(files: FileData[]): number {
		let totalProgress = 0;
		files.forEach((file) => {
			totalProgress += getProgress(file as FileDataWithProgress);
		});

		document.documentElement.style.setProperty(
			"--upload-progress-width",
			(totalProgress / files.length).toFixed(2) + "%"
		);

		return totalProgress / files.length;
	}

	$: calculateTotalProgress(files_with_progress);

	$: file_to_display = current_file_upload || files_with_progress[0];
</script>

<div class="wrap" class:progress>
	<span class="uploading"
		>Uploading {files_with_progress.length}
		{files_with_progress.length > 1 ? "files" : "file"}...</span
	>

	{#if file_to_display}
		<div class="file">
			<span>
				<div class="progress-bar">
					<progress
						style="visibility:hidden;height:0;width:0;"
						value={getProgress(file_to_display)}
						max="100">{getProgress(file_to_display)}</progress
					>
				</div>
			</span>
			<span class="file-name">
				{file_to_display.orig_name}
			</span>
		</div>
	{/if}
</div>

<style>
	.wrap {
		overflow-y: auto;
		transition: opacity 0.5s ease-in-out;
		background: var(--block-background-fill);
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: var(--size-40);
		width: var(--size-full);
	}

	.wrap::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: var(--upload-progress-width);
		height: 100%;
		transition: all 0.5s ease-in-out;
		z-index: 1;
	}

	.uploading {
		font-size: var(--text-lg);
		font-family: var(--font);
		z-index: 2;
	}

	.file-name {
		margin: var(--spacing-md);
		font-size: var(--text-lg);
		color: var(--body-text-color-subdued);
	}

	.file {
		font-size: var(--text-md);
		z-index: 2;
		display: flex;
		align-items: center;
	}

	.file progress {
		display: inline;
		height: var(--size-1);
		width: 100%;
		transition: all 0.5s ease-in-out;
		color: var(--color-accent);
		border: none;
	}

	.file progress[value]::-webkit-progress-value {
		background-color: var(--color-accent);
		border-radius: 20px;
	}

	.file progress[value]::-webkit-progress-bar {
		background-color: var(--border-color-accent);
		border-radius: 20px;
	}

	.progress-bar {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: radial-gradient(
				closest-side,
				var(--block-background-fill) 64%,
				transparent 53% 100%
			),
			conic-gradient(
				var(--color-accent) var(--upload-progress-width),
				var(--border-color-accent) 0
			);
		transition: all 0.5s ease-in-out;
	}
</style>
