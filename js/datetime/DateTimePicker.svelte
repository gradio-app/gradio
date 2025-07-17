<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		format_date,
		generate_calendar_days,
		calculate_display_hour,
		convert_display_hour_to_24h,
		month_names
	} from "./utils";

	export let selected_date: Date;
	export let current_year: number;
	export let current_month: number;
	export let selected_hour: number;
	export let selected_minute: number;
	export let selected_second: number;
	export let is_pm: boolean;
	export let include_time: boolean;
	export let position: { top: number; left: number };

	const dispatch = createEventDispatcher<{
		close: void;
		clear: void;
		update: { date: Date; formatted: string };
	}>();

	$: display_hour = calculate_display_hour(selected_hour, is_pm);
	$: calendar_days = generate_calendar_days(current_year, current_month);

	const select_date = (day: number): void => {
		selected_date = new Date(
			current_year,
			current_month,
			day,
			selected_hour,
			selected_minute,
			selected_second
		);
		update_value();
	};

	const update_value = (): void => {
		const formatted = format_date(selected_date, include_time);
		dispatch("update", { date: selected_date, formatted });
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
		update_value();
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
		selected_hour = convert_display_hour_to_24h(new_hour, is_pm);
		update_time();
	};

	const handle_now = (): void => {
		const now = new Date();
		selected_date = now;
		current_year = now.getFullYear();
		current_month = now.getMonth();
		selected_hour = now.getHours();
		selected_minute = now.getMinutes();
		selected_second = now.getSeconds();
		is_pm = selected_hour >= 12;
		update_value();
	};
</script>

<div
	class="picker-container"
	style="top: {position.top}px; left: {position.left}px;"
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
			<button type="button" class="nav-button" on:click={next_month}>›</button>
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
				on:click={() => dispatch("clear")}
			>
				Clear
			</button>
			<div class="picker-actions-right">
				<button type="button" class="action-button" on:click={handle_now}>
					Now
				</button>
				<button
					type="button"
					class="action-button"
					on:click={() => dispatch("close")}
				>
					Done
				</button>
			</div>
		</div>
	</div>
</div>

<style>
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
		cursor: pointer;
		color: var(--body-text-color-subdued);
	}

	.nav-button:hover {
		background: var(--button-secondary-background-fill-hover);
		color: var(--body-text-color);
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
		cursor: pointer;
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

	.am-pm-label {
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
		cursor: pointer;
	}

	.action-button:hover {
		background: var(--button-secondary-background-fill-hover);
		border-color: var(--button-secondary-border-color-hover);
	}
</style>
