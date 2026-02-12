<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";

	// export let equal_height = true;
	// export let elem_id: string;
	// export let elem_classes: string[] = [];
	// export let visible: boolean | "hidden" = true;
	// export let variant: "default" | "panel" | "compact" = "default";
	// export let loading_status: LoadingStatus | undefined = undefined;
	// export let gradio: Gradio | undefined = undefined;
	// export let show_progress = false;
	// export let height: number | string | undefined;
	// export let min_height: number | string | undefined;
	// export let max_height: number | string | undefined;
	// export let scale: number | null = null;

	const get_dimension = (
		dimension_value: string | number | undefined
	): string | undefined => {
		if (dimension_value === undefined) {
			return undefined;
		}
		if (typeof dimension_value === "number") {
			return dimension_value + "px";
		} else if (typeof dimension_value === "string") {
			return dimension_value;
		}
	};

	let props = $props();
	let gradio = new Gradio<
		{},
		{
			equal_height: boolean | null;
			variant: "default" | "panel" | "compact";
			height: number | string | undefined;
			min_height: number | string | undefined;
			max_height: number | string | undefined;
		}
	>(props);
</script>

<div
	class:compact={gradio.props.variant === "compact"}
	class:panel={gradio.props.variant === "panel"}
	class:unequal-height={gradio.props.equal_height === false}
	class:stretch={gradio.props.equal_height}
	class:hide={!gradio.shared.visible}
	class:grow-children={gradio.shared.scale && gradio.shared.scale >= 1}
	style:height={get_dimension(gradio.props.height)}
	style:max-height={get_dimension(gradio.props.max_height)}
	style:min-height={get_dimension(gradio.props.min_height)}
	style:flex-grow={gradio.shared.scale}
	id={gradio.shared.elem_id}
	class="row {gradio.shared.elem_classes?.join(' ')}"
>
	{#if gradio.shared.loading_status && gradio.shared.loading_status.show_progress && gradio}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			status={gradio.shared.loading_status
				? gradio.shared.loading_status.status == "pending"
					? "generating"
					: gradio.shared.loading_status.status
				: null}
		/>
	{/if}
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-wrap: wrap;
		gap: var(--layout-gap);
		width: var(--size-full);
		position: relative;
	}

	.hide {
		display: none;
	}
	.compact > :global(*),
	.compact :global(.box) {
		border-radius: 0;
	}
	.compact,
	.panel {
		border-radius: var(--container-radius);
		background: var(--background-fill-secondary);
		padding: var(--size-2);
	}
	.unequal-height {
		align-items: flex-start;
	}

	.stretch {
		align-items: stretch;
	}

	.stretch > :global(.column > *),
	.stretch > :global(.column > .form > *) {
		flex-grow: 1;
		flex-shrink: 0;
	}

	div > :global(*),
	div > :global(.form > *) {
		flex: 1 1 0%;
		flex-wrap: wrap;
		min-width: min(160px, 100%);
	}

	.grow-children > :global(.column) {
		align-self: stretch;
	}
</style>
