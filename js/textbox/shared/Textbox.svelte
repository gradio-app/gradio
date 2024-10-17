<script lang="ts">
	import {
		beforeUpdate,
		afterUpdate,
		createEventDispatcher,
		tick
	} from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Copy, Check, Send, Square } from "@gradio/icons";
	import { fade } from "svelte/transition";
	import type { SelectData } from "@gradio/utils";

	export let value = "";
	export let value_is_output = false;
	export let lines = 1;
	export let placeholder = "Type here...";
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;
	export let container = true;
	export let max_lines: number;
	export let type: "text" | "password" | "email" = "text";
	export let show_copy_button = false;
	export let submit_btn: string | boolean | null = null;
	export let stop_btn: string | boolean | null = null;
	export let rtl = false;
	export let autofocus = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autoscroll = true;
	export let max_length: number | undefined = undefined;
	export let root: string;

	let el: HTMLTextAreaElement | HTMLInputElement;
	let copied = false;
	let timer: NodeJS.Timeout;
	let can_scroll: boolean;
	let previous_scroll_top = 0;
	let user_has_scrolled_up = false;

	const show_textbox_border = !submit_btn;

	$: value, el && lines !== max_lines && resize({ target: el });

	$: if (value === null) value = "";

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
		stop: undefined;
		blur: undefined;
		select: SelectData;
		input: undefined;
		focus: undefined;
	}>();

	beforeUpdate(() => {
		can_scroll = el && el.offsetHeight + el.scrollTop > el.scrollHeight - 100;
	});

	const scroll = (): void => {
		if (can_scroll && autoscroll && !user_has_scrolled_up) {
			el.scrollTo(0, el.scrollHeight);
		}
	};

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		if (autofocus) {
			el.focus();
		}
		if (can_scroll && autoscroll) {
			scroll();
		}
		value_is_output = false;
	});
	$: value, handle_change();

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		}
	}

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	function handle_select(event: Event): void {
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

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
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

	function handle_scroll(event: Event): void {
		const target = event.target as HTMLElement;
		const current_scroll_top = target.scrollTop;
		if (current_scroll_top < previous_scroll_top) {
			user_has_scrolled_up = true;
		}
		previous_scroll_top = current_scroll_top;

		const max_scroll_top = target.scrollHeight - target.clientHeight;
		const user_has_scrolled_to_bottom = current_scroll_top >= max_scroll_top;
		if (user_has_scrolled_to_bottom) {
			user_has_scrolled_up = false;
		}
	}

	function handle_stop(): void {
		dispatch("stop");
	}

	function handle_submit(): void {
		dispatch("submit");
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	): Promise<void> {
		await tick();
		if (lines === max_lines) return;

		const target = event.target as HTMLTextAreaElement;
		const computed_styles = window.getComputedStyle(target);
		const padding_top = parseFloat(computed_styles.paddingTop);
		const padding_bottom = parseFloat(computed_styles.paddingBottom);
		const line_height = parseFloat(computed_styles.lineHeight);

		let max =
			max_lines === undefined
				? false
				: padding_top + padding_bottom + line_height * max_lines;
		let min = padding_top + padding_bottom + lines * line_height;

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

	function text_area_resize(
		_el: HTMLTextAreaElement,
		_value: string
	): any | undefined {
		if (lines === max_lines) return;
		_el.style.overflowY = "scroll";
		_el.addEventListener("input", resize);

		if (!_value.trim()) return;
		resize({ target: _el });

		return {
			destroy: () => _el.removeEventListener("input", resize)
		};
	}
</script>

<!-- svelte-ignore a11y-autofocus -->
<label class:container class:show_textbox_border>
	<BlockTitle {root} {show_label} {info}>{label}</BlockTitle>

	<div class="input-container">
		{#if lines === 1 && max_lines === 1}
			{#if type === "text"}
				<input
					data-testid="textbox"
					type="text"
					class="scroll-hide"
					dir={rtl ? "rtl" : "ltr"}
					bind:value
					bind:this={el}
					{placeholder}
					{disabled}
					{autofocus}
					maxlength={max_length}
					on:keypress={handle_keypress}
					on:blur
					on:select={handle_select}
					on:focus
					style={text_align ? "text-align: " + text_align : ""}
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
					{autofocus}
					maxlength={max_length}
					on:keypress={handle_keypress}
					on:blur
					on:select={handle_select}
					on:focus
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
					{autofocus}
					maxlength={max_length}
					on:keypress={handle_keypress}
					on:blur
					on:select={handle_select}
					on:focus
					autocomplete="email"
				/>
			{/if}
		{:else}
			{#if show_label && show_copy_button}
				{#if copied}
					<button
						in:fade={{ duration: 300 }}
						class="copy-button"
						aria-label="Copied"
						aria-roledescription="Text copied"><Check /></button
					>
				{:else}
					<button
						on:click={handle_copy}
						class="copy-button"
						aria-label="Copy"
						aria-roledescription="Copy text"><Copy /></button
					>
				{/if}
			{/if}
			<textarea
				data-testid="textbox"
				use:text_area_resize={value}
				class="scroll-hide"
				dir={rtl ? "rtl" : "ltr"}
				class:no-label={!show_label && (submit_btn || stop_btn)}
				bind:value
				bind:this={el}
				{placeholder}
				rows={lines}
				{disabled}
				{autofocus}
				maxlength={max_length}
				on:keypress={handle_keypress}
				on:blur
				on:select={handle_select}
				on:focus
				on:scroll={handle_scroll}
				style={text_align ? "text-align: " + text_align : ""}
			/>
		{/if}
		{#if submit_btn}
			<button
				class="submit-button"
				class:padded-button={submit_btn !== true}
				on:click={handle_submit}
			>
				{#if submit_btn === true}
					<Send />
				{:else}
					{submit_btn}
				{/if}
			</button>
		{/if}
		{#if stop_btn}
			<button
				class="stop-button"
				class:padded-button={stop_btn !== true}
				on:click={handle_stop}
			>
				{#if stop_btn === true}
					<Square fill="none" stroke_width={2.5} />
				{:else}
					{stop_btn}
				{/if}
			</button>
		{/if}
	</div>
</label>

<style>
	label {
		display: block;
		width: 100%;
	}

	input,
	textarea {
		flex-grow: 1;
		outline: none !important;
		margin-top: 0px;
		margin-bottom: 0px;
		resize: none;
		z-index: 1;
		display: block;
		position: relative;
		outline: none !important;
		background: var(--input-background-fill);
		padding: var(--input-padding);
		width: 100%;
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		border: none;
	}
	textarea.no-label {
		padding-top: 5px;
		padding-bottom: 5px;
	}
	label.show_textbox_border input,
	label.show_textbox_border textarea {
		box-shadow: var(--input-shadow);
	}
	label:not(.container),
	label:not(.container) input,
	label:not(.container) textarea {
		height: 100%;
	}
	label.container.show_textbox_border input,
	label.container.show_textbox_border textarea {
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
	}
	input:disabled,
	textarea:disabled {
		-webkit-opacity: 1;
		opacity: 1;
	}

	label.container.show_textbox_border input:focus,
	label.container.show_textbox_border textarea:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
		background: var(--input-background-fill-focus);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--input-placeholder-color);
	}

	.copy-button {
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

	/* Same submit button style as MultimodalTextbox for the consistent UI */
	.input-container {
		display: flex;
		position: relative;
		align-items: flex-end;
	}
	.submit-button,
	.stop-button {
		border: none;
		text-align: center;
		text-decoration: none;
		font-size: 14px;
		cursor: pointer;
		border-radius: 15px;
		min-width: 30px;
		height: 30px;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: var(--layer-1);
	}
	.stop-button,
	.submit-button {
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
	}
	.stop-button:hover,
	.submit-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}
	.stop-button:disabled,
	.submit-button:disabled {
		background: var(--button-secondary-background-fill);
		cursor: pointer;
	}
	.stop-button:active,
	.submit-button:active {
		box-shadow: var(--button-shadow-active);
	}
	.submit-button :global(svg) {
		height: 22px;
		width: 22px;
	}

	.stop-button :global(svg) {
		height: 16px;
		width: 16px;
	}
	.padded-button {
		padding: 0 10px;
	}
</style>
