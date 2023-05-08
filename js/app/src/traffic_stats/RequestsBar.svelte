<script lang="ts">
    import { task_status_colors } from "./utils";
    import type { TaskStatus } from "./utils";

    export let request_breakdown: Partial<Record<TaskStatus, number>>;
    export let total_requests: number;
    const TASK_STATUS_DESCRIPTIONS: Record<TaskStatus, string> = {
        success: "Successfully completed, with data delivered to the user.",
        pending: "Has not completed processing.",
        closed: "Stopped early because user closed the browser.",
        waiting_connection:
            "Completed processing, but unable to deliver results due to connection. Will become 'lost' if reconnection fails.",
        lost: "Completed processing, but failed to deliver the result to the user due to connection.",
        error: "An event that failed because the function raised an exception.",
        stopped: "An event stopped because the user triggered a cancellation.",
    };
</script>

{#if total_requests > 0}
    <div class="bar">
        {#each Object.entries(request_breakdown) as [key, value], i}
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <div
                class="bar-item"
                style:width="{(value / total_requests) * 100}%"
                style:background-color="rgba({task_status_colors[key]}, 0.2)"
                style:display={value > 0 ? "block" : "none"}
            >
                <div class="bar-name">
                    {key}
                    <span class="description">
                        : {TASK_STATUS_DESCRIPTIONS[key]}</span
                    >
                </div>
                {value}
            </div>
        {/each}
    </div>
{/if}

<style>
    .bar {
        display: flex;
        cursor: pointer;
    }
    .bar-item {
        padding: var(--size-2) var(--size-3);
        overflow: hidden;
    }
    .bar-name {
        font-size: var(--text-sm);
        font-weight: var(--weight-bold);
        display: flex;
    }
    .description {
        font-weight: normal;
        display: none;
    }
    .bar-item:hover .description {
        display: block;
    }
    .bar:hover .bar-item:hover {
        width: 100%;
        flex-grow: 1;
        display: block !important;
    }
    .bar:hover .bar-item:not(:hover) {
        width: 0px !important;
        flex-grow: 0;
    }
</style>
