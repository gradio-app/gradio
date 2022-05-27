<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { JSON } from "@gradio/json";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { JSON as JSONIcon } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: any;
	export let loading_status: LoadingStatus;
	export let label: string;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<Block test_id="json" {elem_id} {visible}>
	{#if label}
		<BlockLabel Icon={JSONIcon} {label} />
	{/if}

	<StatusTracker {...loading_status} />

	{#if value && value !== '""'}
		<JSON {value} />
	{:else}
		<div class="h-full min-h-[6rem] flex justify-center items-center">
			<div class="h-7 dark:text-white opacity-50"><JSONIcon /></div>
		</div>
	{/if}
</Block>
