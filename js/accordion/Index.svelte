<script lang="ts">
	import Accordion from "./shared/Accordion.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	import { BaseColumn } from "@gradio/column";
	import { Gradio, css_units } from "@gradio/utils";
	import type { SharedProps } from "@gradio/utils";

	import type { AccordionProps, AccordionEvents } from "./types";
	import { tick } from "svelte";

	let props = $props();
	class AccordionGradio extends Gradio<AccordionEvents, AccordionProps> {
		set_data(data: Partial<object & SharedProps>): void {
			const old_open = this.props.open;
			super.set_data(data);
			if ("open" in data && data.open !== old_open) {
				this.dispatch(data.open ? "expand" : "collapse");
			}
			this.shared.loading_status.status = "complete";
		}
	}
	const gradio = new AccordionGradio(props);

	// Children of a closed accordion are not rendered until it opens. Ask for
	// them whenever the accordion is open, including when it mounts already
	// open, whether that came from a header click or a backend update.
	$effect(() => {
		if (gradio.props.open) {
			// wait for the open state to reach the DOM before rendering children
			tick().then(() => gradio.dispatch("gradio_expand"));
		}
	});

	let label = $derived(gradio.shared.label || "");
	let elem_classes = $derived([
		...(gradio.shared.elem_classes || []),
		"gr-accordion"
	]);

	let visibility: boolean | "hidden" = $derived(
		gradio.shared.visible === true ? true : "hidden"
	);
</script>

<Block elem_id={gradio.shared.elem_id} {elem_classes} visible={visibility}>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
		/>
	{/if}

	<Accordion
		{label}
		bind:open={gradio.props.open}
		height={gradio.props.height != null
			? css_units(gradio.props.height)
			: undefined}
		max_height={gradio.props.max_height != null
			? css_units(gradio.props.max_height)
			: undefined}
		onexpand={() => gradio.dispatch("expand")}
		oncollapse={() => gradio.dispatch("collapse")}
	>
		<BaseColumn>
			{@render props.children?.()}
		</BaseColumn>
	</Accordion>
</Block>
