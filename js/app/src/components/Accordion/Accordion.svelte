<script lang="ts">
	import { Accordion } from "@gradio/accordion";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { Component as Column } from "../Column";

	export let label: string;
	export let elem_id: string | undefined = undefined;
	export let elem_classes: Array<string> | undefined = undefined;
	export let visible: boolean = true;
	export let open: boolean = true;
	export let loading_status: LoadingStatus | undefined = undefined;
</script>

<Block {elem_id} {elem_classes} {visible}>
	{#if loading_status}
		<StatusTracker {...loading_status} />
	{/if}

	<Accordion {label} {open}>
		<Column>
			<slot />
		</Column>
	</Accordion>
</Block>
