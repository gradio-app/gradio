<script lang="ts">
	import { tick } from "svelte";
	import { BlockTitle, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { Copy, Check, Send, Square } from "@gradio/icons";
	import type {
		SelectData,
		CopyData,
		CustomButton as CustomButtonType
	} from "@gradio/utils";
	import type { InputHTMLAttributes } from "../types";

	let {
		value = $bindable(""),
		value_is_output = $bindable(false),
		lines = 1,
		placeholder = "",
		label,
		info = undefined,
		disabled = false,
		show_label = true,
		container = true,
		max_lines = undefined,
		type = "text",
		buttons = null,
		on_custom_button_click = null,
		submit_btn = null,
		stop_btn = null,
		rtl = false,
		autofocus = false,
		text_align = undefined,
		autoscroll = true,
		max_length = undefined,
		html_attributes = null,
		validation_error = undefined,
		on_change,
		on_submit,
		on_stop,
		on_blur,
		on_select,
		on_input,
		on_focus,
		on_copy
	}: {
		value?: string;
		value_is_output?: boolean;
		lines?: number;
		placeholder?: string;
		label: string;
		info?: string | undefined;
		disabled?: boolean;
		show_label?: boolean;
		container?: boolean;
		max_lines?: number | undefined;
		type?: "text" | "password" | "email";
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		submit_btn?: string | boolean | null;
		stop_btn?: string | boolean | null;
		rtl?: boolean;
		autofocus?: boolean;
		text_align?: "left" | "right" | undefined;
		autoscroll?: boolean;
		max_length?: number | undefined;
		html_attributes?: InputHTMLAttributes | null;
		validation_error?: string | null | undefined;
		on_change?: (value: string) => void;
		on_submit?: () => void;
		on_stop?: () => void;
		on_blur?: () => void;
		on_select?: (data: SelectData) => void;
		on_input?: (value: string) => void;
		on_focus?: () => void;
		on_copy?: (data: CopyData) => void;
	} = $props();

	let el: HTMLTextAreaElement | HTMLInputElement;
	let copied = $state(false);
	let timer: NodeJS.Timeout;
	let can_scroll = $state(false);
	let previous_scroll_top = $state(0);
	let user_has_scrolled_up = $state(false);
	let _max_lines = $state(1);
	let ghost_element: HTMLTextAreaElement | null = null;

	const show_textbox_border = !submit_btn;

	$effect(() => {
		if (max_lines === undefined || max_lines === null) {
			if (type === "text") {
				_max_lines = Math.max(lines, 20);
			} else {
				_max_lines = 1;
			}
		} else {
			_max_lines = Math.max(max_lines, lines);
		}
	});

	$effect(() => {
		value;
		validation_error;
		if (el && lines !== _max_lines && lines > 1) {
			resize({ target: el });
		}
	});

	$effect(() => {
		if (value === null) value = "";
	});

	$effect.pre(() => {
		if (
			!user_has_scrolled_up &&
			el &&
			el.offsetHeight + el.scrollTop > el.scrollHeight - 100
		) {
			can_scroll = true;
		}
	});

	const scroll = (): void => {
		if (can_scroll && autoscroll && !user_has_scrolled_up) {
			el.scrollTo(0, el.scrollHeight);
		}
	};

	async function handle_change(): Promise<void> {
		await tick();
		on_change?.(value);
	}

	$effect(() => {
		if (autofocus && el) {
			el.focus();
		}
		if (can_scroll && autoscroll) {
			scroll();
		}
		value_is_output = false;
	});

	$effect(() => {
		value;
		handle_change();
	});

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			on_copy?.({ value: value });
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
		on_select?.({ value: text.substring(...index), index: index });
	}

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			await tick();
			on_submit?.();
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			_max_lines >= 1
		) {
			e.preventDefault();
			await tick();
			on_submit?.();
		}
		await tick();
		on_input?.(value);
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
		on_stop?.();
	}

	function handle_submit(): void {
		on_submit?.();
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	): Promise<void> {
		await tick();
		if (lines === _max_lines) return;

		const target = event.target as HTMLTextAreaElement;
		const computed_styles = window.getComputedStyle(target);
		const padding_top = parseFloat(computed_styles.paddingTop);
		const padding_bottom = parseFloat(computed_styles.paddingBottom);
		const line_height = parseFloat(computed_styles.lineHeight);

		let max =
			_max_lines === undefined
				? false
				: padding_top + padding_bottom + line_height * _max_lines;
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

		update_scrollbar_visibility(target);
	}

	function update_scrollbar_visibility(textarea: HTMLTextAreaElement): void {
		// Using "auto" scroll does not work, as the scrollbar is visible even
		// when the content is about the same height as the textarea height. So
		// here, we add the scrollbar if the content is longer than a threshold
		// of 1 line height beyond the textarea height.
		const content_height = textarea.scrollHeight;
		const visible_height = textarea.clientHeight;
		const line_height = parseFloat(
			window.getComputedStyle(textarea).lineHeight
		);
		if (content_height > visible_height + line_height) {
			textarea.style.overflowY = "scroll";
		} else {
			textarea.style.overflowY = "hidden";
		}
	}

	function text_area_resize(
		_el: HTMLTextAreaElement,
		_value: string
	): any | undefined {
		if (lines === _max_lines || (lines === 1 && _max_lines === 1)) return;

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
	{#if show_label && buttons && buttons.length > 0}
		<IconButtonWrapper {buttons} {on_custom_button_click}>
			{#if buttons.some((btn) => typeof btn === "string" && btn === "copy")}
				<IconButton
					Icon={copied ? Check : Copy}
					onclick={handle_copy}
					label={copied ? "Copied" : "Copy"}
				/>
			{/if}
		</IconButtonWrapper>
	{/if}
	<BlockTitle show_label={validation_error ? true : show_label} {info}
		>{label}
		{#if validation_error}
			<div class="validation-error">{validation_error}</div>
		{/if}
	</BlockTitle>

	<div class="input-container">
		{#if lines === 1 && _max_lines === 1}
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
					onkeypress={handle_keypress}
					onblur={() => on_blur?.()}
					onselect={handle_select}
					onfocus={() => on_focus?.()}
					class:validation-error={validation_error}
					style={text_align ? "text-align: " + text_align : ""}
					autocapitalize={html_attributes?.autocapitalize}
					autocorrect={html_attributes?.autocorrect}
					spellcheck={html_attributes?.spellcheck}
					autocomplete={html_attributes?.autocomplete}
					tabindex={html_attributes?.tabindex}
					enterkeyhint={html_attributes?.enterkeyhint}
					lang={html_attributes?.lang}
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
					onkeypress={handle_keypress}
					onblur={() => on_blur?.()}
					onselect={handle_select}
					onfocus={() => on_focus?.()}
					class:validation-error={validation_error}
					autocomplete=""
					autocapitalize={html_attributes?.autocapitalize}
					autocorrect={html_attributes?.autocorrect}
					spellcheck={html_attributes?.spellcheck}
					tabindex={html_attributes?.tabindex}
					enterkeyhint={html_attributes?.enterkeyhint}
					lang={html_attributes?.lang}
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
					onkeypress={handle_keypress}
					onblur={() => on_blur?.()}
					onselect={handle_select}
					onfocus={() => on_focus?.()}
					class:validation-error={validation_error}
					autocomplete="email"
					autocapitalize={html_attributes?.autocapitalize}
					autocorrect={html_attributes?.autocorrect}
					spellcheck={html_attributes?.spellcheck}
					tabindex={html_attributes?.tabindex}
					enterkeyhint={html_attributes?.enterkeyhint}
					lang={html_attributes?.lang}
				/>
			{/if}
		{:else}
			<textarea
				data-testid="textbox"
				use:text_area_resize={value}
				dir={rtl ? "rtl" : "ltr"}
				class:no-label={!show_label && (submit_btn || stop_btn)}
				bind:value
				bind:this={el}
				{placeholder}
				rows={lines}
				{disabled}
				{autofocus}
				maxlength={max_length}
				onkeypress={handle_keypress}
				onblur={() => on_blur?.()}
				onselect={handle_select}
				onfocus={() => on_focus?.()}
				onscroll={handle_scroll}
				class:validation-error={validation_error}
				style={text_align ? "text-align: " + text_align : ""}
				autocapitalize={html_attributes?.autocapitalize}
				autocorrect={html_attributes?.autocorrect}
				spellcheck={html_attributes?.spellcheck}
				autocomplete={html_attributes?.autocomplete}
				tabindex={html_attributes?.tabindex}
				enterkeyhint={html_attributes?.enterkeyhint}
				lang={html_attributes?.lang}
			/>
		{/if}
		{#if submit_btn}
			<button
				class="submit-button"
				class:padded-button={submit_btn !== true}
				onclick={handle_submit}
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
				onclick={handle_stop}
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

	input[type="text"],
	input[type="password"],
	input[type="email"],
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

	div.validation-error {
		color: var(--error-icon-color);
		font-size: var(--font-sans);
		margin-top: var(--spacing-sm);
		font-weight: var(--weight-semibold);
	}

	label.container input.validation-error,
	label.container textarea.validation-error {
		border-color: transparent !important;
		box-shadow:
			0 0 3px 1px var(--error-icon-color),
			var(--shadow-inset) !important;
	}
</style>
