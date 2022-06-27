<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { get_styles } from "@gradio/utils";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "#000000";
	export let style: Record<string, unknown> = {};
	export let label: string;
	export let disabled = false;
	export let show_label: boolean = true;

	$: value;
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
	}>();

	function handle_change(val: string) {
		console.log(val);
		dispatch("change", val);
	}

	$: ({ classes } = get_styles(style, ["rounded", "border"]));
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="color"
		class="gr-box-unrounded {classes}"
		bind:value={value}
		{disabled}
	/>
</label>
