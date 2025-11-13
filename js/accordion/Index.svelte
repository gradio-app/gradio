<script lang="ts">
	import Accordion from "./shared/Accordion.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import { BaseColumn } from "@gradio/column";
	import { Gradio } from "@gradio/utils";

	import type { AccordionProps, AccordionEvents } from "./types";

	let props = $props();
	const gradio = new Gradio<AccordionEvents, AccordionProps>(props);

	let label = $derived(gradio.shared.label || "");
</script>

<Block
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
		/>
	{/if}

	<Accordion
		{label}
		open={gradio.props.open}
		on:expand={() => gradio.dispatch("expand")}
		on:collapse={() => gradio.dispatch("collapse")}
	>
		<BaseColumn>
			<slot />
		</BaseColumn>
	</Accordion>
</Block>
