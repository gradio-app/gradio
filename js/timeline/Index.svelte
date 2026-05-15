<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import type { SharedProps } from "@gradio/utils";
	import { Block } from "@gradio/atoms";

	interface TimelineEvent {
		title: string;
		description?: string;
		timestamp?: string;
		status?: "completed" | "in-progress" | "pending" | "error";
		icon?: string;
		color?: string;
	}

	interface TimelineProps {
		value: TimelineEvent[] | null;
		layout: "vertical" | "horizontal";
	}

	let _props: { shared_props: SharedProps; props: TimelineProps } = $props();
	const gradio = new Gradio<never, TimelineProps>(_props);

	function get_status_icon(status: string | undefined): string {
		switch (status) {
			case "completed":
				return "✓";
			case "in-progress":
				return "⟳";
			case "error":
				return "✗";
			default:
				return "○";
		}
	}

	function get_status_class(status: string | undefined): string {
		switch (status) {
			case "completed":
				return "status-completed";
			case "in-progress":
				return "status-in-progress";
			case "error":
				return "status-error";
			default:
				return "status-pending";
		}
	}

	function handle_select(event: MouseEvent, index: number) {
		if (gradio.shared.interactive) {
			gradio.dispatch("select", { index });
		}
	}
</script>

<Block
	elem_id={gradio.shared.elem_id}
	elem_classes={["gradio-timeline", `layout-${gradio.props.layout}`, ...gradio.shared.elem_classes]}
	show_label={gradio.shared.show_label}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	visible={gradio.shared.visible}
	label={gradio.shared.label || "Timeline"}
>
	<div class="timeline-container layout-{gradio.props.layout}">
		{#each gradio.props.value ?? [] as event, index}
			<div
				class="timeline-item {gradio.shared.interactive ? 'interactive' : ''}"
				onclick={(e) => handle_select(e, index)}
			>
				<div class="timeline-node">
					<div class="timeline-dot {get_status_class(event.status)}">
						{get_status_icon(event.status)}
					</div>
					{#if index < (gradio.props.value?.length ?? 0) - 1}
						<div class="timeline-line"></div>
					{/if}
				</div>
				<div class="timeline-content">
					<div class="timeline-header">
						<span class="timeline-title">{event.title}</span>
						{#if event.timestamp}
							<span class="timeline-timestamp">{event.timestamp}</span>
						{/if}
					</div>
					{#if event.description}
						<div class="timeline-description">{event.description}</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</Block>

<style>
	.gradio-timeline {
		width: 100%;
	}

	.timeline-container {
		padding: var(--spacing-lg);
	}

	.timeline-container.layout-vertical {
		display: flex;
		flex-direction: column;
	}

	.timeline-container.layout-horizontal {
		display: flex;
		flex-direction: row;
		overflow-x: auto;
		gap: var(--spacing-lg);
	}

	.timeline-item {
		display: flex;
		position: relative;
	}

	.layout-vertical .timeline-item {
		flex-direction: row;
		padding-bottom: var(--spacing-lg);
	}

	.layout-vertical .timeline-item:last-child {
		padding-bottom: 0;
	}

	.layout-horizontal .timeline-item {
		flex-direction: column;
		min-width: 200px;
		flex: 1;
	}

	.timeline-item.interactive {
		cursor: pointer;
	}

	.timeline-item.interactive:hover .timeline-content {
		background: var(--block-background-fill-hover);
	}

	.timeline-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.layout-vertical .timeline-node {
		margin-right: var(--spacing-md);
	}

	.layout-horizontal .timeline-node {
		margin-bottom: var(--spacing-md);
		align-items: flex-start;
	}

	.timeline-dot {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: var(--text-md);
		flex-shrink: 0;
		z-index: 1;
		border: 2px solid var(--block-background-fill);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.status-completed {
		background: var(--color-success);
		color: white;
	}

	.status-in-progress {
		background: var(--color-primary);
		color: white;
		animation: pulse 2s infinite;
	}

	.status-pending {
		background: var(--color-neutral-200);
		color: var(--color-neutral-500);
	}

	.status-error {
		background: var(--color-error);
		color: white;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	.timeline-line {
		position: absolute;
		top: 32px;
		width: 2px;
		height: calc(100% - 32px);
		background: var(--border-color-primary);
	}

	.layout-horizontal .timeline-line {
		top: 16px;
		left: 16px;
		width: calc(100% - 16px);
		height: 2px;
	}

	.timeline-content {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		transition: background var(--transition);
	}

	.layout-horizontal .timeline-content {
		padding-top: var(--spacing-sm);
	}

	.timeline-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.timeline-title {
		font-weight: var(--text-md);
		font-size: var(--text-md);
		color: var(--block-title-text-color);
	}

	.timeline-timestamp {
		font-size: var(--text-sm);
		color: var(--color-neutral-500);
		white-space: nowrap;
	}

	.timeline-description {
		margin-top: var(--spacing-xs);
		font-size: var(--text-sm);
		color: var(--color-neutral-600);
	}
</style>
