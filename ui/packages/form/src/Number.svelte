<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { styleClasses } from "@gradio/utils";
	import { BlockTitle, Block } from "@gradio/atoms";

	export let value: number = 0;
	export let style: Record<string, string> = {};
	export let disabled: boolean = false;
	export let integer: boolean = false;
	export let label: string;
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

	function validator(node, n) {
		return {
			update(n) {
				value = integer ? Math.floor(n) : n;
			}
		};
	}

	$: handle_change(value);
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>
	<input
		type="number"
		class={"gr-box gr-input w-full gr-text-input" + styleClasses(style)}
		bind:value
		use:validator={value}
		on:keypress={handle_keypress}
		{disabled}
	/>
</label>
