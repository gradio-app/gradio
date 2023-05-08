<script lang="ts">
    import TrafficBanner from "./TrafficBanner.svelte";
    import RequestsBar from "./RequestsBar.svelte";
    import Queue from "./Queue.svelte";
    import type { QueuePreview, Task } from "./utils";
    import type { task_status } from "./utils";

    import { Block, BlockTitle } from "@gradio/atoms";
    import Row from "../components/Row/Row.svelte";
    import Column from "../components/Column/Column.svelte";
    import Form from "../components/Form/Form.svelte";
    import Accordion from "../components/Accordion/Accordion.svelte";

    let sessions: number = 12;
    let request_breakdown: Record<task_status, number> = {
        success: 101,
        pending: 2,
        closed: 20,
        lost: 3,
        error: 33,
        stopped: 1,
    };
    const total_requests_fn = (breakdown: Record<task_status, number>) => {
        return Object.values(breakdown).reduce((a, b) => a + b, 0);
    };
    let requests_per_function: Array<[string, Record<task_status, number>]> = [
        [
            "predict",
            {
                success: 51,
                pending: 2,
                closed: 10,
                error: 3,
                stopped: 1,
            },
        ],
        [
            "classify_image",
            {
                success: 5,
                pending: 0,
                closed: 10,
                error: 30,
                stopped: 0,
            },
        ],
    ];
    let event_count_per_stage: [number, number, number, number] = [12, 3, 4, 2]

    let queue_preview: QueuePreview = [
        [
            { id: "1", fn: "classify_image" },
            { id: "2", fn: "classify_image" },
            { id: "3", fn: "predict" },
            { id: "4", fn: "predict" },
            { id: "5", fn: "predict" },
            { id: "6", fn: "predict" },
            { id: "7", fn: "predict" },
            { id: "8", fn: "predict" },
        ],
        [
            { id: "9", fn: "classify_image" },
            { id: "10", fn: "classify_image" },
            { id: "11", fn: "predict" },
        ],
        [
            { id: "12", fn: "classify_image" },
            { id: "13", fn: "classify_image" },
            { id: "14", fn: "predict" },
        ],
        [
            { id: "15", fn: "classify_image" },
            { id: "16", fn: "classify_image" },
            { id: "17", fn: "predict" },
        ],
    ];
    export let flattened_queue: Array<[Task, number, number]>;
    $: {
        flattened_queue = [];
        for (let i = 0; i < queue_preview.length; i++) {
            for (let j = 0; j < queue_preview[i].length; j++) {
                flattened_queue.push([queue_preview[i][j], i, j]);
            }
        }
        flattened_queue = flattened_queue;
    }
    window.setInterval(() => {
        if (queue_preview[0].length != 0) {
            queue_preview[1].push(queue_preview[0].shift() as Task);
        }
        if (queue_preview[1].length != 0) {
            queue_preview[2].unshift(queue_preview[1].shift() as Task);
            if (Math.random() < 0.3) {
                queue_preview[2][0].status = "error";
            }
        }
        queue_preview = queue_preview;
    }, 3000)
</script>

<TrafficBanner on:close />

<div class="content-wrap">
    <Column>
        <Row>
            <Form>
                <Block>
                    <BlockTitle>Total Sessions</BlockTitle>
                    <div class="stat">{sessions}</div>
                </Block>
                <Block>
                    <BlockTitle>Total Requests</BlockTitle>
                    <div class="stat">{total_requests_fn(request_breakdown)}</div>
                </Block>
                <Block>
                    <BlockTitle>Pending Requests</BlockTitle>
                    <div class="stat">{request_breakdown["pending"]}</div>
                </Block>
            </Form>
        </Row>
        <Block>
            <BlockTitle info="Hover for more details."
                >Request Breakdown</BlockTitle
            >
            <div class="requests-breakdown">
                <RequestsBar {request_breakdown} total_requests={total_requests_fn(request_breakdown)} />
            </div>
            <Accordion open={false} label="Requests per Function">
                <div class="fn-breakdowns">
                    {#each requests_per_function as [fn, request_breakdown]}
                        <div class="fn-breakdown">
                            <div class="fn">{fn}: {total_requests_fn(request_breakdown)}</div>
                            <RequestsBar {request_breakdown} total_requests={total_requests_fn(request_breakdown)} />
                        </div>
                    {/each}
                </div>
            </Accordion>
        </Block>
        <Block>
            <BlockTitle>Queue</BlockTitle>
            <Queue {flattened_queue} {event_count_per_stage} />
        </Block>
    </Column>
</div>

<style>
    .content-wrap {
        padding: var(--size-6);
    }
    .stat {
        font-size: var(--text-xxl);
        font-weight: var(--weight-semibold);
    }
    .requests-breakdown {
        margin-bottom: var(--size-2);
    }

    .fn-breakdowns {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }
    .fn {
        font-size: var(--text-sm);
        margin-bottom: var(--size-1);
    }
</style>
