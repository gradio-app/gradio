<script lang="ts">
	import Sidebar from "./shared/Sidebar.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";
	import Column from "@gradio/column";
	export let open = true;
	export let position: "left" | "right" = "left";
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		expand: never;
		collapse: never;
	}>;
	export let width: number | string;
	export let visible: boolean | "hidden" = true;
	export let elem_classes: string[] = [];
	export let elem_id = "";
</script>

<StatusTracker
	autoscroll={gradio.autoscroll}
	i18n={gradio.i18n}
	{...loading_status}
/>

{#if visible}
	<Sidebar
		bind:open
		bind:position
		{width}
		on:expand={() => gradio.dispatch("expand")}
		on:collapse={() => gradio.dispatch("collapse")}
		{elem_classes}
		{elem_id}
	>
		<Column>
			<slot />
		</Column>
	</Sidebar>
{/if}
