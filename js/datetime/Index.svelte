<script context="module" lang="ts">
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { Calendar } from "@gradio/icons";
	import { onDestroy } from "svelte";

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
	export let root: string;

	export let include_time = true;

	let show_picker = false;
	let picker_ref: HTMLDivElement;
	let input_ref: HTMLInputElement;
	let timebox_ref: HTMLDivElement;
	let calendar_button_ref: HTMLButtonElement;
	let picker_position = { top: 0, left: 0 };

	$: if (value !== old_value) {
		old_value = value;
		entered_value = value;
		update_picker_from_value();
		gradio.dispatch("change");
	}

	const format_date = (date: Date): string => {
		if (date.toJSON() === null) return "";
		const pad = (num: number): string => num.toString().padStart(2, "0");

		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		const seconds = pad(date.getSeconds());

		const date_str = `${year}-${month}-${day}`;
		const time_str = `${hours}:${minutes}:${seconds}`;
		if (include_time) {
			return `${date_str} ${time_str}`;
		}
		return date_str;
	};

	let entered_value = value;

	const date_is_valid_format = (date: string | null): boolean => {
		if (date === null || date === "") return true;
		const valid_regex = include_time
			? /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
			: /^\d{4}-\d{2}-\d{2}$/;
		const is_valid_date = date.match(valid_regex) !== null;
		const is_valid_now =
			date.match(/^(?:\s*now\s*(?:-\s*\d+\s*[dmhs])?)?\s*$/) !== null;
		return is_valid_date || is_valid_now;
	};

	$: valid = date_is_valid_format(entered_value);

	const submit_values = (): void => {
		if (entered_value === value) return;
		if (!date_is_valid_format(entered_value)) return;
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

	$: display_hour = is_pm
		? selected_hour === 0
			? 12
			: selected_hour > 12
				? selected_hour - 12
				: selected_hour
		: selected_hour === 0
			? 12
			: selected_hour;

	const month_names = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];

	const get_days_in_month = (year: number, month: number): number => {
		return new Date(year, month + 1, 0).getDate();
	};

	const get_first_day_of_month = (year: number, month: number): number => {
		return new Date(year, month, 1).getDay();
	};

	const update_picker_from_value = (): void => {
		if (entered_value && entered_value !== "") {
			try {
				let date_to_parse = entered_value;
				if (!include_time && entered_value.match(/^\d{4}-\d{2}-\d{2}$/)) {
					date_to_parse += " 00:00:00";
				}

				const parsed = new Date(date_to_parse.replace(" ", "T"));
				if (!isNaN(parsed.getTime())) {
					selected_date = parsed;
					current_year = parsed.getFullYear();
					current_month = parsed.getMonth();
					selected_hour = parsed.getHours();
					selected_minute = parsed.getMinutes();
					selected_second = parsed.getSeconds();
					is_pm = selected_hour >= 12;
				}
			} catch (e) {
				const now = new Date();
				selected_date = now;
				current_year = now.getFullYear();
				current_month = now.getMonth();
				selected_hour = now.getHours();
				selected_minute = now.getMinutes();
				selected_second = now.getSeconds();
				is_pm = selected_hour >= 12;
			}
		}
	};

	const select_date = (day: number): void => {
		selected_date = new Date(
			current_year,
			current_month,
			day,
			selected_hour,
			selected_minute,
			selected_second
		);
		update_value_from_picker();
	};

	const update_value_from_picker = (): void => {
		entered_value = format_date(selected_date);
		submit_values();
	};

	const update_time = (): void => {
		selected_date = new Date(
			current_year,
			current_month,
			selected_date.getDate(),
			selected_hour,
			selected_minute,
			selected_second
		);
		update_value_from_picker();
	};

	const previous_month = (): void => {
		if (current_month === 0) {
			current_month = 11;
			current_year--;
		} else {
			current_month--;
		}
	};

	const next_month = (): void => {
		if (current_month === 11) {
			current_month = 0;
			current_year++;
		} else {
			current_month++;
		}
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
					}
				}, 10);
			} else if (typeof window !== "undefined") {
				window.removeEventListener("click", handle_click_outside);
			}
		}
	};

	const close_picker = (): void => {
		show_picker = false;
		if (typeof window !== "undefined") {
			window.removeEventListener("click", handle_click_outside);
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

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("click", handle_click_outside);
		}
	});

	$: calendar_days = (() => {
		const days_in_month = get_days_in_month(current_year, current_month);
		const first_day = get_first_day_of_month(current_year, current_month);
		const days = [];

		const prev_month = current_month === 0 ? 11 : current_month - 1;
		const prev_year = current_month === 0 ? current_year - 1 : current_year;
		const days_in_prev_month = get_days_in_month(prev_year, prev_month);

		for (let i = first_day - 1; i >= 0; i--) {
			days.push({
				day: days_in_prev_month - i,
				is_current_month: false,
				is_next_month: false
			});
		}

		for (let day = 1; day <= days_in_month; day++) {
			days.push({
				day,
				is_current_month: true,
				is_next_month: false
			});
		}

		const remaining_slots = 42 - days.length;
		for (let day = 1; day <= remaining_slots; day++) {
			days.push({
				day,
				is_current_month: false,
				is_next_month: true
			});
		}

		return days;
	})();

	update_picker_from_value();

	const toggle_am_pm = (): void => {
		is_pm = !is_pm;
		if (is_pm && selected_hour < 12) {
			selected_hour += 12;
		} else if (!is_pm && selected_hour >= 12) {
			selected_hour -= 12;
		}
		update_time();
	};

	const update_display_hour = (new_hour: number): void => {
		if (is_pm) {
			selected_hour = new_hour === 12 ? 12 : new_hour + 12;
		} else {
			selected_hour = new_hour === 12 ? 0 : new_hour;
		}
		update_time();
	};
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
		<BlockTitle {root} {show_label} {info}>{label}</BlockTitle>
	</div>
	<div bind:this={timebox_ref} class="timebox">
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
		<div
			bind:this={picker_ref}
			class="picker-container"
			style="top: {picker_position.top}px; left: {picker_position.left}px;"
		>
			<div class="picker">
				<div class="picker-header">
					<button type="button" class="nav-button" on:click={previous_month}
						>‹</button
					>
					<div class="month-year">
						{month_names[current_month]}
						{current_year}
					</div>
					<button type="button" class="nav-button" on:click={next_month}
						>›</button
					>
				</div>

				<div class="calendar-grid">
					<div class="weekdays">
						<div class="weekday">Su</div>
						<div class="weekday">Mo</div>
						<div class="weekday">Tu</div>
						<div class="weekday">We</div>
						<div class="weekday">Th</div>
						<div class="weekday">Fr</div>
						<div class="weekday">Sa</div>
					</div>

					<div class="days">
						{#each calendar_days as { day, is_current_month, is_next_month }}
							<button
								type="button"
								class="day"
								class:other-month={!is_current_month}
								class:selected={is_current_month &&
									day === selected_date.getDate() &&
									current_month === selected_date.getMonth() &&
									current_year === selected_date.getFullYear()}
								on:click={() => {
									if (is_current_month) {
										select_date(day);
									} else if (is_next_month) {
										next_month();
										select_date(day);
									} else {
										previous_month();
										select_date(day);
									}
								}}
							>
								{day}
							</button>
						{/each}
					</div>
				</div>

				{#if include_time}
					<div class="time-picker">
						<div class="time-inputs">
							<div class="time-input-group">
								<label for="hour">Hour</label>
								<input
									id="hour"
									type="number"
									min="1"
									max="12"
									bind:value={display_hour}
									on:input={() => update_display_hour(display_hour)}
								/>
							</div>
							<div class="time-input-group">
								<label for="minute">Min</label>
								<input
									id="minute"
									type="number"
									min="0"
									max="59"
									bind:value={selected_minute}
									on:input={update_time}
								/>
							</div>
							<div class="time-input-group">
								<label for="second">Sec</label>
								<input
									id="second"
									type="number"
									min="0"
									max="59"
									bind:value={selected_second}
									on:input={update_time}
								/>
							</div>
							<div class="time-input-group">
								<span class="am-pm-label">Period</span>
								<button
									type="button"
									class="am-pm-toggle"
									on:click={toggle_am_pm}
									aria-label="Toggle AM/PM"
								>
									{is_pm ? "PM" : "AM"}
								</button>
							</div>
						</div>
					</div>
				{/if}

				<div class="picker-actions">
					<button
						type="button"
						class="action-button"
						on:click={() => {
							entered_value = "";
							value = "";
							close_picker();
							gradio.dispatch("change");
						}}
					>
						Clear
					</button>
					<div class="picker-actions-right">
						<button
							type="button"
							class="action-button"
							on:click={() => {
								const now = new Date();
								selected_date = now;
								current_year = now.getFullYear();
								current_month = now.getMonth();
								selected_hour = now.getHours();
								selected_minute = now.getMinutes();
								selected_second = now.getSeconds();
								is_pm = selected_hour >= 12;
								update_value_from_picker();
							}}
						>
							Now
						</button>
						<button type="button" class="action-button" on:click={close_picker}>
							Done
						</button>
					</div>
				</div>
			</div>
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

	.picker-container {
		position: fixed;
		z-index: 9999;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-lg);
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
	}

	.picker {
		padding: var(--size-3);
		min-width: 280px;
	}

	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--size-3);
	}

	.nav-button {
		background: none;
		border: none;
		font-size: var(--text-lg);
		padding: var(--size-1);
		border-radius: var(--radius-sm);
		transition: var(--button-transition);
	}

	.nav-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.month-year {
		font-weight: var(--weight-semibold);
		font-size: var(--text-base);
		color: var(--body-text-color);
	}

	.calendar-grid {
		margin-bottom: var(--size-3);
	}

	.weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
		margin-bottom: var(--size-2);
	}

	.weekday {
		text-align: center;
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--body-text-color-subdued);
		padding: var(--size-1);
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
	}

	.day {
		aspect-ratio: 1;
		border: none;
		background: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		transition: var(--button-transition);
		color: var(--body-text-color);
	}

	.day:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.day.other-month {
		color: var(--body-text-color-subdued);
	}

	.day.selected {
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
	}

	.day.selected:hover {
		background: var(--button-primary-background-fill-hover);
	}

	.time-picker {
		border-top: 1px solid var(--border-color-primary);
		padding-top: var(--size-3);
		margin-bottom: var(--size-3);
	}

	.time-inputs {
		display: flex;
		gap: var(--size-2);
		justify-content: center;
	}

	.time-input-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-1);
	}

	.time-input-group label {
		font-size: var(--text-xs);
		color: var(--body-text-color-subdued);
		font-weight: var(--weight-semibold);
	}

	.time-input-group input {
		width: 50px;
		padding: var(--size-1);
		border: 1px solid var(--input-border-color);
		border-radius: var(--radius-sm);
		text-align: center;
		font-size: var(--text-sm);
		background: var(--input-background-fill);
		color: var(--body-text-color);
	}

	.time-input-group input:focus {
		outline: none;
		border-color: var(--input-border-color-focus);
		box-shadow: var(--input-shadow-focus);
	}

	.picker-actions {
		display: flex;
		gap: var(--size-2);
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--border-color-primary);
		padding-top: var(--size-3);
	}

	.picker-actions-right {
		display: flex;
		gap: var(--size-2);
	}

	.action-button {
		padding: var(--size-1) var(--size-3);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-sm);
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		font-size: var(--text-sm);
		transition: var(--button-transition);
	}

	.action-button:hover {
		background: var(--button-secondary-background-fill-hover);
		border-color: var(--button-secondary-border-color-hover);
	}

	.am-pm-label {
		font-size: var(--text-xs);
		color: var(--body-text-color-subdued);
		font-weight: var(--weight-semibold);
	}

	.am-pm-toggle {
		width: 50px;
		padding: var(--size-1);
		border: 1px solid var(--button-primary-border-color);
		border-radius: var(--radius-sm);
		text-align: center;
		font-size: var(--text-sm);
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
		cursor: pointer;
		transition: var(--button-transition);
	}

	.am-pm-toggle:hover {
		background: var(--button-primary-background-fill-hover);
		border-color: var(--button-primary-border-color-hover);
	}

	.am-pm-toggle:focus {
		outline: none;
		border-color: var(--button-primary-border-color-focus);
		box-shadow: var(--button-primary-shadow-focus);
	}
</style>
