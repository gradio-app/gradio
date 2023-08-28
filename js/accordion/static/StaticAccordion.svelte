<script lang="ts">
	import Accordion from "./Accordion.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import Column from "@gradio/column";

	export let label: string;
	export let elem_id: string;
	export let elem_classes: string[];
	export let visible = true;
	export let open = true;
	export let loading_status: LoadingStatus;
</script>

<Block {elem_id} {elem_classes} {visible}>
	<StatusTracker {...loading_status} />

	<Accordion {label} {open}>
		<Column>
			<slot />
		</Column>
	</Accordion>
</Block>
