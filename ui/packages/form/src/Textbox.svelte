<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "";
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let style: string = "";
	export let disabled = false;
	export let autoheight: boolean;
	export let show_label: boolean;

	let el: HTMLTextAreaElement;

	$: value, el && autoheight && resize({ target: el });
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
	}>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter" && lines === 1) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	async function resize(event: Event | { target: HTMLTextAreaElement }) {
		await tick();

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";
		target.style.height = +target.scrollHeight + "px";
	}

	function text_area_resize(el: HTMLTextAreaElement, value: string) {
		if (!autoheight) return;

		el.style.overflow = "hidden";
		el.addEventListener("input", resize);

		if (!value.trim()) return;
		resize({ target: el });

		return {
			destroy: () => el.removeEventListener("input", resize)
		};
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block">
	<BlockTitle {show_label}>{label}</BlockTitle>

	{#if autoheight || lines > 1}
		<textarea
			use:text_area_resize={value}
			class="block gr-box gr-input w-full gr-text-input"
			bind:value
			bind:this={el}
			{placeholder}
			{style}
			rows={lines}
			{disabled}
		/>
	{:else}
		<input
			type="text"
			class="gr-box gr-input w-full gr-text-input"
			{placeholder}
			bind:value
			on:keypress={handle_keypress}
			{style}
			{disabled}
		/>
	{/if}
</label>
