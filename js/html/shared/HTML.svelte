<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let min_height: number | undefined = undefined;
	export let loading_status: { status: string } | undefined = undefined;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	const css_units = (dimension_value: string | number): string => {
		return typeof dimension_value === "number"
			? dimension_value + "px"
			: dimension_value;
	};
</script>

<div
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	style:min-height={min_height && loading_status?.status !== "pending"
		? css_units(min_height)
		: undefined}
>
	{@html value}
</div>

<style>
	.hide {
		display: none;
	}
</style>
