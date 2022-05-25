<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let label: string;
	export let value: string | undefined = undefined;
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: string }>();

	$: dispatch("change", value);

	const { rounded, border } = get_styles(style, ["rounded", "border"]);
</script>

<label>
	<BlockTitle {show_label}>{label}</BlockTitle>
	<select
		class="gr-box gr-input w-full disabled:cursor-not-allowed {rounded} {border}"
		bind:value
		{disabled}
	>
		{#each choices as choice, i}
			<option>{choice}</option>
		{/each}
	</select>
</label>
