<script lang="ts">
	import { afterUpdate, createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Copy, Check } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import type { Styles } from "@gradio/utils";
	import type { SelectData } from "@gradio/utils";

	export let value: string = "";
	export let value_is_output: boolean = false;
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label: boolean = true;
	export let max_lines: number | false;
	export let type: "text" | "password" | "email" = "text";
	export let style: Styles = {};

	let el: HTMLTextAreaElement | HTMLInputElement;
	let copied = false;
	let timer: NodeJS.Timeout;

	$: value, el && lines !== max_lines && resize({ target: el });

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
		blur: undefined;
		select: SelectData;
		input: undefined;
	}>();

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();

	function handle_blur() {
		dispatch("blur");
	}

	async function handle_copy() {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		}
	}

	function copy_feedback() {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	function handle_select(event: Event) {
		const target: HTMLTextAreaElement | HTMLInputElement = event.target as
			| HTMLTextAreaElement
			| HTMLInputElement;
		const text = target.value;
		const index: [number, number] = [
			target.selectionStart as number,
			target.selectionEnd as number
		];
		dispatch("select", { value: text.substring(...index), index: index });
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			dispatch("submit");
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			max_lines >= 1
		) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	) {
		await tick();
		if (lines === max_lines) return;

		let max =
			max_lines === false
				? false
				: max_lines === undefined // default
				? 21 * 11
				: 21 * (max_lines + 1);
		let min = 21 * (lines + 1);

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";

		let scroll_height;
		if (max && target.scrollHeight > max) {
			scroll_height = max;
		} else if (target.scrollHeight < min) {
			scroll_height = min;
		} else {
			scroll_height = target.scrollHeight;
		}

		target.style.height = `${scroll_height}px`;
	}

	function text_area_resize(el: HTMLTextAreaElement, value: string) {
		if (lines === max_lines) return;
		el.style.overflowY = "scroll";
		el.addEventListener("input", resize);

		if (!value.trim()) return;
		resize({ target: el });

		return {
			destroy: () => el.removeEventListener("input", resize)
		};
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	{#if lines === 1 && max_lines === 1}
		{#if type === "text"}
			<input
				data-testid="textbox"
				type="text"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				on:select={handle_select}
			/>
		{:else if type === "password"}
			<input
				data-testid="password"
				type="password"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				on:select={handle_select}
				autocomplete=""
			/>
		{:else if type === "email"}
			<input
				data-testid="textbox"
				type="email"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				on:select={handle_select}
				autocomplete="email"
			/>
		{/if}
	{:else}
		{#if show_label && style.show_copy_button}
			{#if copied}
				<button in:fade={{ duration: 300 }}><Check /></button>
			{:else}
				<button on:click={handle_copy} class="copy-text"><Copy /></button>
			{/if}
		{/if}
		<textarea
			data-testid="textbox"
			use:text_area_resize={value}
			class="scroll-hide"
			bind:value
			bind:this={el}
			{placeholder}
			rows={lines}
			{disabled}
			on:keypress={handle_keypress}
			on:blur={handle_blur}
			on:select={handle_select}
		/>
	{/if}
</label>

<style>
	label {
		display: block;
		width: 100%;
	}

	input[type="text"],
	input[type="password"],
	input[type="email"],
	textarea {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
	}
	input:disabled,
	textarea:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	input:focus,
	textarea:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--input-placeholder-color);
	}
	button {
		display: flex;
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		align-items: center;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: 5px;
		width: 22px;
		height: 22px;
		overflow: hidden;
		color: var(--block-label-color);
		font: var(--font-sans);
		font-size: var(--button-small-text-size);
	}
</style>
