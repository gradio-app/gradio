<script lang="ts">
	import type { QueuePreview, Task, TaskStatus } from "./utils";
	import TaskCard from "./TaskCard.svelte";
	import { flip } from "svelte/animate";

	export let queue_preview: QueuePreview;
	export let event_count_per_stage: [number, number, number, number] = [
		12, 3, 4, 2
	];
	export let active_workers: number;
	let active_workers_array = Array.from({ length: active_workers });
	let flattened_queue: Array<[Task, number, number]>;
	$: {
		flattened_queue = [];
		for (let i = 0; i < queue_preview.length; i++) {
			for (let j = 0; j < queue_preview[i].length; j++) {
				flattened_queue.push([queue_preview[i][j], i, j]);
			}
		}
		flattened_queue = flattened_queue;
	}

	const SPACING = 60;
	const STATUS_PER_STAGE: TaskStatus[] = [
		"queued",
		"pending",
		"success",
		"waiting_reconnection"
	];
</script>

<div class="wrapper">
	{#each active_workers_array as _, i}
		<div
			class="worker-box"
			style:top="{1 * SPACING}px"
			style:left="{i * SPACING}px"
		/>
	{/each}
	{#each flattened_queue as [task, i, j] (task.idx)}
		<div
			class="task-holder"
			style:top="{i * SPACING}px"
			style:left="{j * SPACING}px"
			animate:flip
		>
			<TaskCard {task} status={task.status ?? STATUS_PER_STAGE[i]} />
		</div>
	{/each}
	<div class="row-label" style:top="0px">
		Queued ({event_count_per_stage[0]})
	</div>
	<div class="row-label" style:top="{SPACING}px">
		Processing ({event_count_per_stage[1]})
	</div>
	<div class="row-label" style:top="{SPACING * 2}px">
		Completed ({event_count_per_stage[2]})
	</div>
	<div class="row-label" style:top="{SPACING * 3}px">
		Reconnecting ({event_count_per_stage[3]})
	</div>
	{#each event_count_per_stage as event_count, i}
		{#if event_count > queue_preview[i].length}
			<div
				class="row-extra"
				style:left="{queue_preview[i].length * SPACING}px"
				style:top="{(i + 0.5) * SPACING}px"
			>
				(+{event_count - queue_preview[i].length} more)
			</div>
		{/if}
		<hr style:top="{i * SPACING}px" />
	{/each}
</div>

<style>
	.wrapper {
		position: relative;
		background-color: var(--background-fill-secondary);
		height: 240px;
		overflow: hidden;
	}
	.wrapper > * {
		position: absolute;
	}
	.row-label {
		right: 0px;
		background-color: var(--background-fill-secondary);
		padding: 6px;
		color: var(--body-text-color-subdued);
		font-weight: 600;
	}
	.row-extra {
		transition: all 0.7s linear;
		padding: 6px;
		color: var(--body-text-color-subdued);
	}
	hr {
		border-color: var(--border-color-primary);
		width: 100%;
		height: 1px;
	}
	.worker-box {
		border: dashed 3px var(--border-color-primary);
		width: 60px;
		height: 60px;
	}
</style>
