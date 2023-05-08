<script lang="ts">
    import { task_status_colors } from "./utils";
    import type { task_status } from "./utils";

    export let request_breakdown: Record<task_status, number>;
    export let total_requests: number;
;
    let hovered_request: string | null = null;    
    const TASK_STATUS_DESCRIPTIONS: Record<task_status, string> = {
        success: "A successfully completed event.",
        pending: "An event still in progress.",
        closed: "An event stopped early because the user closed the browser.",
        lost: "An event that successfully finished processing, but was not able to deliver the result to the user.",
        error: "An event that failed because the function raised an exception.",
        stopped: "An event stopped because the user triggered a cancellation.",
    };

</script>

<div class="bar">
    {#each Object.entries(request_breakdown) as [key, value], i}
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div
            class="bar-item"
            style="width: {hovered_request
                ? hovered_request === key
                    ? 100
                    : 0
                : (value / total_requests) *
                  100}%; background-color: rgba({task_status_colors[
                key
            ]}, 0.2);"
            on:mouseover={() => (hovered_request = key)}
            on:mouseout={() => (hovered_request = null)}
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
</style>
