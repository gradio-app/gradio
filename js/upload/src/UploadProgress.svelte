<script lang="ts">
	import { FileData } from "@gradio/client";
	import { onMount, createEventDispatcher } from "svelte";

	type FileDataWithProgress = FileData & { progress: number };

	export let upload_id: string;
	export let root: string;
	export let files: FileData[];

	let event_source: EventSource;

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

	onMount(() => {
		event_source = new EventSource(
			`${root}/upload_progress?upload_id=${upload_id}`
		);
		// Event listener for progress updates
		event_source.onmessage = async function (event) {
			const _data = JSON.parse(event.data);
			if (_data.msg === "done") {
				event_source.close();
				dispatch("done");
			} else {
				handleProgress(_data.orig_name, _data.chunk_size);
			}
		};
	});
</script>

<div class="wrap">
	{#each files_with_progress as file, index}
		<div class="file-info">
			<span>Uploading {file.orig_name}...</span>
		</div>
		<div class="progress-bar-wrap">
			<div class="progress-bar" style="width: {getProgress(file)}%;"></div>
		</div>
	{/each}
</div>

<style>
	.wrap {
		margin-top: var(--size-7);
		overflow-y: auto;
	}

	.progress-bar-wrap {
		border: 1px solid var(--border-color-primary);
		background: var(--background-fill-primary);
		height: var(--size-4);
	}
	.progress-bar {
		transform-origin: left;
		background-color: var(--loader-color);
		height: var(--size-full);
	}

	.file-info {
		height: 100%;
		justify-content: center;
		text-align: center;
		width: 100%;
	}

	.file-info span {
		color: var(--body-text-color);
		font-size: var(--text-med);
		font-family: var(--font-mono);
	}
</style>
