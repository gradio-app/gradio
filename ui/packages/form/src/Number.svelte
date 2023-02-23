<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: number = 0;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean = true;

	const dispatch = createEventDispatcher<{
		change: number;
		submit: undefined;
		blur: undefined;
	}>();

	function handle_change(n: number) {
		if (!isNaN(n) && n !== null) {
			dispatch("change", n);
		}
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter") {
			e.preventDefault();
			dispatch("submit");
		}
	}

	$: handle_change(value);

	function handle_blur(e: FocusEvent) {
		dispatch("blur");
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label} {info}>{label}</BlockTitle>
	<input
		type="number"
		bind:value
		on:keypress={handle_keypress}
		on:blur={handle_blur}
		{disabled}
	/>
</label>

<style>
	input[type="number"] {
		--ring-color: transparent;
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: 0 0 0 var(--shadow-spread) var(--ring-color),
			var(--shadow-inset);
		border: 1px solid var(--input-border-color-base);
		border-radius: var(--radius-lg);
		background: var(--input-background-base);
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	input:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder {
		color: var(--color-text-placeholder);
	}

	input[disabled] {
		box-shadow: none;
	}
</style>
