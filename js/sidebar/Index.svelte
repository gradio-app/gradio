<script lang="ts">
	import Sidebar from "./shared/Sidebar.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import Column from "@gradio/column";
	import type { Gradio } from "@gradio/utils";

	export let label: string;
	export let elem_id: string;
	export let elem_classes: string[];
	export let visible = true;
	export let open = true;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		expand: never;
		collapse: never;
	}>;
</script>

<StatusTracker
	autoscroll={gradio.autoscroll}
	i18n={gradio.i18n}
	{...loading_status}
/>

<Sidebar
	bind:open
	on:expand={() => gradio.dispatch("expand")}
	on:collapse={() => gradio.dispatch("collapse")}
>
	<Column>
		<slot />
	</Column>
</Sidebar>
