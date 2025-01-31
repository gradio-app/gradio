<script lang="ts">
	import Sidebar from "./shared/Sidebar.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import type { Gradio } from "@gradio/utils";
	export let open = true;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		expand: never;
		collapse: never;
	}>;
	export let width: number | string;
</script>

<StatusTracker
	autoscroll={gradio.autoscroll}
	i18n={gradio.i18n}
	{...loading_status}
/>

<Sidebar
	bind:open
	{width}
	on:expand={() => gradio.dispatch("expand")}
	on:collapse={() => gradio.dispatch("collapse")}
>
	<slot />
</Sidebar>
