<script lang="ts">
    import RequestsBar from "./RequestsBar.svelte";
    import Queue from "./Queue.svelte";
    import type { ActivityLog, TaskStatus, RequestBreakdown } from "./utils";

    import { Block, BlockTitle } from "@gradio/atoms";
    import Row from "../components/Row/Row.svelte";
    import Column from "../components/Column/Column.svelte";
    import Form from "../components/Form/Form.svelte";
    import Accordion from "../components/Accordion/Accordion.svelte";

    const total_requests_fn = (breakdown: RequestBreakdown) => {
        return Object.values(breakdown).reduce((a, b) => a + b, 0);
    };
    export let sessions: ActivityLog["sessions"];
    export let request_breakdown: ActivityLog["request_breakdown"];
    export let requests_per_fn: ActivityLog["requests_per_fn"];
    export let event_count_per_stage: ActivityLog["event_count_per_stage"];
    export let queue_preview: ActivityLog["queue_preview"] | undefined =
        undefined;
</script>

<Column>
    <Row>
        <Form>
            <Block>
                <BlockTitle>Total Sessions</BlockTitle>
                <div class="stat">{sessions}</div>
            </Block>
            <Block>
                <BlockTitle>Total Requests</BlockTitle>
                <div class="stat">
                    {total_requests_fn(request_breakdown)}
                </div>
            </Block>
        </Form>
    </Row>
    <Block>
        <BlockTitle info="Hover for more details.">Request Breakdown</BlockTitle
        >
        <div class="requests-breakdown">
            <RequestsBar
                {request_breakdown}
                total_requests={total_requests_fn(request_breakdown)}
            />
        </div>
        <Accordion open={false} label="Requests per Function">
            <div class="fn-breakdowns">
                {#each requests_per_fn as { fn, duration, request_breakdown }}
                    {#if total_requests_fn(request_breakdown) > 0}
                        <div class="fn-breakdown">
                            <div class="fn">
                                <span>{fn}</span>
                                <span class="details"
                                    >{total_requests_fn(request_breakdown)} requests
                                    &bull; {duration.toFixed(1)}s of processing
                                    per success</span
                                >
                            </div>
                            <RequestsBar
                                {request_breakdown}
                                total_requests={total_requests_fn(
                                    request_breakdown
                                )}
                            />
                        </div>
                    {/if}
                {/each}
            </div>
        </Accordion>
    </Block>
    {#if queue_preview}
        <Block>
            <BlockTitle>Queue</BlockTitle>
            <Queue {queue_preview} {event_count_per_stage} />
        </Block>
    {/if}
</Column>

<style>
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
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--size-1);
    }
    .fn .details {
        color: var(--body-text-color-subdued);
    }
</style>
