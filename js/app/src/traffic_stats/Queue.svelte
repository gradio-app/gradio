<script lang="ts">
    import type { QueuePreview, Task } from "./utils";
    import TaskCard from "./TaskCard.svelte";
    import { flip } from 'svelte/animate';

    export let queue_preview: QueuePreview;
    export let event_count_per_stage: [number, number, number, number] = [12, 3, 4, 2]
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
</script>

<div class="wrapper">
    {#each flattened_queue as [task, i, j] (task[0])}
        <div
            class="task-holder"
            style:top="{i * SPACING}px"
            style:left="{j * SPACING}px"
            animate:flip
        >
            <TaskCard
                {task}
                status={task.length == 3
                    ? task[2]
                    : i == 0
                    ? "pending"
                    : i == 1
                    ? "pending"
                    : i == 2
                    ? "success"
                    : i == 3
                    ? "waiting_connection"
                    : undefined}
            />
        </div>
    {/each}
    <div class="row-label" style:top="0px">Queued ({event_count_per_stage[0]})</div>
    <div class="row-label" style:top="{SPACING}px">Processing ({event_count_per_stage[1]})</div>
    <div class="row-label" style:top="{SPACING * 2}px">Completed ({event_count_per_stage[2]})</div>
    <div class="row-label" style:top="{SPACING * 3}px">Reconnecting ({event_count_per_stage[3]})</div>
    {#each event_count_per_stage as event_count, i}
        {#if event_count > queue_preview[i].length}
            <div class="row-extra" style:left="{queue_preview[i].length * SPACING}px" style:top="{(i + 0.5) * SPACING}px">
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
        font-weight: 600;
        padding: 6px;
        color: var(--body-text-color-subdued);
        background-color: var(--background-fill-secondary);
    }
    .row-extra {
        padding: 6px;
        color: var(--body-text-color-subdued);
        transition: all 0.7s linear;
    }
    hr {
        width: 100%;
        height: 1px;
        border-color: var(--border-color-primary);
    }
</style>
