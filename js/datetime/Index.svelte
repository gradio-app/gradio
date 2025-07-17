<script context="module" lang="ts">
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { Calendar } from "@gradio/icons";
	import { onDestroy } from "svelte";
	import DateTimePicker from "./DateTimePicker.svelte";
	import { format_date, date_is_valid_format, parse_date_value } from "./utils";

	export let gradio: Gradio<{
		change: undefined;
		submit: undefined;
	}>;
	export let label = "Time";
	export let show_label = true;
	export let info: string | undefined = undefined;
	export let interactive: boolean;
	$: disabled = !interactive;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	let old_value = value;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let include_time = true;

	let show_picker = false;
	let picker_ref: HTMLDivElement;
	let input_ref: HTMLInputElement;
	let calendar_button_ref: HTMLButtonElement;
	let picker_position = { top: 0, left: 0 };

	$: if (value !== old_value) {
		old_value = value;
		entered_value = value;
		update_picker_from_value();
		gradio.dispatch("change");
	}

	let entered_value = value;

	$: valid = date_is_valid_format(entered_value, include_time);

	const submit_values = (): void => {
		if (entered_value === value) return;
		if (!date_is_valid_format(entered_value, include_time)) return;
		old_value = value = entered_value;
		gradio.dispatch("change");
	};

	let current_year = new Date().getFullYear();
	let current_month = new Date().getMonth();
	let selected_date = new Date();
	let selected_hour = new Date().getHours();
	let selected_minute = new Date().getMinutes();
	let selected_second = new Date().getSeconds();
	let is_pm = selected_hour >= 12;

	const update_picker_from_value = (): void => {
		const parsed = parse_date_value(entered_value, include_time);
		selected_date = parsed.selected_date;
		current_year = parsed.current_year;
		current_month = parsed.current_month;
		selected_hour = parsed.selected_hour;
		selected_minute = parsed.selected_minute;
		selected_second = parsed.selected_second;
		is_pm = parsed.is_pm;
	};

	const calculate_picker_position = (): void => {
		if (calendar_button_ref) {
			const rect = calendar_button_ref.getBoundingClientRect();
			picker_position = {
				top: rect.bottom + 4,
				left: rect.right - 280
			};
		}
	};

	const toggle_picker = (event: MouseEvent): void => {
		if (!disabled) {
			event.stopPropagation();
			show_picker = !show_picker;
			if (show_picker) {
				update_picker_from_value();
				calculate_picker_position();
				setTimeout(() => {
					if (typeof window !== "undefined") {
						window.addEventListener("click", handle_click_outside);
						window.addEventListener("scroll", handle_scroll, true);
					}
				}, 10);
			} else if (typeof window !== "undefined") {
				window.removeEventListener("click", handle_click_outside);
				window.removeEventListener("scroll", handle_scroll, true);
			}
		}
	};

	const close_picker = (): void => {
		show_picker = false;
		if (typeof window !== "undefined") {
			window.removeEventListener("click", handle_click_outside);
			window.removeEventListener("scroll", handle_scroll, true);
		}
	};

	const handle_click_outside = (event: MouseEvent): void => {
		if (
			show_picker &&
			picker_ref &&
			!picker_ref.contains(event.target as Node) &&
			calendar_button_ref &&
			!calendar_button_ref.contains(event.target as Node)
		) {
			close_picker();
		}
	};

	const handle_scroll = (): void => {
		if (show_picker) {
			calculate_picker_position();
		}
	};

	const handle_picker_update = (
		event: CustomEvent<{ date: Date; formatted: string }>
	): void => {
		entered_value = event.detail.formatted;
		submit_values();
	};

	const handle_picker_clear = (): void => {
		entered_value = "";
		value = "";
		close_picker();
		gradio.dispatch("change");
	};

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("click", handle_click_outside);
			window.removeEventListener("scroll", handle_scroll, true);
		}
	});

	update_picker_from_value();
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={true}
>
	<div class="label-content">
		<BlockTitle {show_label} {info}>{label}</BlockTitle>
	</div>
	<div class="timebox">
		<input
			bind:this={input_ref}
			class="time"
			bind:value={entered_value}
			class:invalid={!valid}
			on:keydown={(evt) => {
				if (evt.key === "Enter") {
					submit_values();
					gradio.dispatch("submit");
				}
			}}
			on:blur={submit_values}
			{disabled}
			placeholder={include_time ? "YYYY-MM-DD HH:MM:SS" : "YYYY-MM-DD"}
		/>

		{#if interactive}
			<button
				bind:this={calendar_button_ref}
				class="calendar"
				{disabled}
				on:click={toggle_picker}
			>
				<Calendar />
			</button>
		{/if}
	</div>

	{#if show_picker}
		<div bind:this={picker_ref}>
			<DateTimePicker
				bind:selected_date
				bind:current_year
				bind:current_month
				bind:selected_hour
				bind:selected_minute
				bind:selected_second
				bind:is_pm
				{include_time}
				position={picker_position}
				on:update={handle_picker_update}
				on:clear={handle_picker_clear}
				on:close={close_picker}
			/>
		</div>
	{/if}
</Block>

<style>
	.label-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	button {
		cursor: pointer;
		color: var(--body-text-color-subdued);
	}

	button:hover {
		color: var(--body-text-color);
	}

	::placeholder {
		color: var(--input-placeholder-color);
	}

	.timebox {
		flex-grow: 1;
		flex-shrink: 1;
		display: flex;
		position: relative;
		background: var(--input-background-fill);
	}

	.timebox :global(svg) {
		height: 18px;
	}

	.time {
		padding: var(--input-padding);
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		outline: none;
		flex-grow: 1;
		background: none;
		border: var(--input-border-width) solid var(--input-border-color);
		border-right: none;
		border-top-left-radius: var(--input-radius);
		border-bottom-left-radius: var(--input-radius);
		box-shadow: var(--input-shadow);
	}

	.time:disabled {
		border-right: var(--input-border-width) solid var(--input-border-color);
		border-top-right-radius: var(--input-radius);
		border-bottom-right-radius: var(--input-radius);
	}

	.time.invalid {
		color: var(--body-text-color-subdued);
	}

	.calendar {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: var(--button-transition);
		box-shadow: var(--button-primary-shadow);
		text-align: center;
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		font-weight: var(--button-large-text-weight);
		font-size: var(--button-large-text-size);
		border-top-right-radius: var(--input-radius);
		border-bottom-right-radius: var(--input-radius);
		padding: var(--size-2);
		border: var(--input-border-width) solid var(--input-border-color);
	}

	.calendar:hover {
		background: var(--button-secondary-background-fill-hover);
		box-shadow: var(--button-primary-shadow-hover);
	}

	.calendar:active {
		box-shadow: var(--button-primary-shadow-active);
	}
</style>
