<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle, Block } from "@gradio/atoms";

	export let n: number = 0;
	export let disabled: boolean = false;
	export let label: string;
	export let style: string = "";
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: number;
		submit: undefined;
	}>();

	function handle_change(n: number) {
		dispatch("change", n);
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			dispatch("submit");
		}
	}

	function validator(node, value) {
	return {
    	update(value) {
			n = Math.floor(value);
      	}
    	}
	}

	$: handle_change(n);
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="number"
		class="gr-box gr-input w-full gr-text-input"
		bind:value={n}
		use:validator={n}
		on:keypress={handle_keypress}
		{disabled}
	/>
</label>
