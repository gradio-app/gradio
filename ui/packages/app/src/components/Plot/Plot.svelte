<script lang="ts">
	import { Plot } from "@gradio/plot";

	import { Block, BlockLabel } from "@gradio/atoms";
	import { Plot as PlotIcon } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	export let value: null | string = null;
	export let elem_id: string = "";

	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
</script>

<Block padding={false} {elem_id}>
	<BlockLabel {show_label} label={label || "Plot"} Icon={PlotIcon} />

	<StatusTracker {...loading_status} />

	<Plot {value} on:change />
</Block>
