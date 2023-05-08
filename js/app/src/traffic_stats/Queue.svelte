<script lang="ts">
    import type { QueuePreview, Task } from "./utils";
    import TaskCard from "./TaskCard.svelte";
    import { flip } from 'svelte/animate';

    export let flattened_queue: Array<[Task, number, number]>;
    export let event_count_per_stage: [number, number, number, number] = [12, 3, 4, 2]

    const SPACING = 60;
</script>

<div class="wrapper">
    {#each flattened_queue as [task, i, j] (task.id)}
        <div
            class="task-holder"
            style:top="{i * SPACING}px"
            style:left="{j * SPACING}px"
            animate:flip
        >
            <TaskCard
                {task}
                status={task.status
                    ? task.status
                    : i == 0
                    ? "pending"
                    : i == 1
                    ? "pending"
                    : i == 2
                    ? "success"
                    : i == 3
                    ? "stopped"
                    : undefined}
            />
        </div>
    {/each}
    <div class="row-label" style:top="0px">Queued ({event_count_per_stage[0]})</div>
    <div class="row-label" style:top="{SPACING}px">Processing ({event_count_per_stage[1]})</div>
    <div class="row-label" style:top="{SPACING * 2}px">Completed ({event_count_per_stage[2]})</div>
    <div class="row-label" style:top="{SPACING * 3}px">Reconnecting ({event_count_per_stage[3]})</div>
    <hr style:top="{SPACING}px" />
    <hr style:top="{SPACING * 2}px" />
    <hr style:top="{SPACING * 3}px" />
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
    hr {
        width: 100%;
        height: 1px;
        border-color: var(--border-color-primary);
    }
</style>
