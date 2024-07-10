<script context="module" lang="ts">
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { Back, Calendar } from "@gradio/icons";

	export let gradio: Gradio<{
		change: undefined;
		submit: undefined;
	}>;
	export let label = "Time Range";
	export let show_label = true;
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [string, string] = ["", ""];
	let old_value = value;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;

	export let quick_ranges: string[] = [];
	export let include_time: boolean = true;
	let range_history: [string, string][] = [];
	$: if (value[0] !== old_value[0] || value[1] !== old_value[1]) {
		old_value = value;
		start_time = value[0];
		end_time = value[1];
		range_history.push(value);
		gradio.dispatch("change");
	}

	const format_date = (date: Date): string => {
		if (date.toJSON() === null) return "";
		const pad = (num: number): string => num.toString().padStart(2, "0");

		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1); // getMonth() returns 0-11
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		const seconds = pad(date.getSeconds());

		const date_str = `${year}-${month}-${day}`;
		const time_str = `${hours}:${minutes}:${seconds}`;
		if (include_time) {
			return `${date_str} ${time_str}`;
		} else {
			return date_str;
		}
	};

	let start_time = value[0];
	let end_time = value[1];

	let datetime1: HTMLInputElement;
	let datevalue1 = "";
	let datetime2: HTMLInputElement;
	let datevalue2 = "";

	const date_is_valid_format = (date: string): boolean => {
		if (date === "") return false;
		const valid_regex = include_time
			? /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
			: /^\d{4}-\d{2}-\d{2}$/;
		const is_valid_date = date.match(valid_regex) !== null;
		const is_valid_now =
			date.match(/^(?:\s*now\s*(?:-\s*\d+\s*[dmhs])?)?\s*$/) !== null;
		return is_valid_date || is_valid_now;
	};

	$: start_time_valid = date_is_valid_format(start_time);
	$: end_time_valid = date_is_valid_format(end_time);

	const submit_values = (): void => {
		if (!date_is_valid_format(start_time) || !date_is_valid_format(end_time))
			return;
		if (start_time === value[0] && end_time === value[1]) return;
		old_value = value = [start_time, end_time];
		range_history = [...range_history, value];
		gradio.dispatch("change");
	};

	const back_in_history = (): void => {
		range_history.pop();
		const last_range = range_history.pop();
		if (last_range === undefined) {
			start_time = "";
			end_time = "";
			range_history = [];
		} else {
			start_time = last_range[0];
			end_time = last_range[1];
			submit_values();
		}
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
		<BlockTitle {show_label} {info}>{label}</BlockTitle>
		{#if show_label}
			<div class="quick-ranges">
				<button
					class="quick-range"
					style:display={range_history.length === 0 ? "none" : "block"}
					on:click={back_in_history}>Back</button
				>

				{#each quick_ranges as quick_range}
					<button
						class="quick-range"
						on:click={() => {
							start_time = "now - " + quick_range;
							end_time = "now";
							submit_values();
						}}>Last {quick_range}</button
					>
				{/each}
			</div>
		{/if}
	</div>
	<div class="datetimerange">
		<div class="timebox">
			<input
				class="start"
				placeholder="From"
				bind:value={start_time}
				class:invalid={!start_time_valid}
				on:keydown={(evt) => {
					if (evt.key === "Enter") {
						submit_values();
						gradio.dispatch("submit");
					}
				}}
				on:blur={submit_values}
			/>
			{#if include_time}
				<input
					type="datetime-local"
					class="datetime"
					step="1"
					bind:this={datetime1}
					bind:value={datevalue1}
					on:input={() => {
						const date = new Date(datevalue1);
						start_time = format_date(date);
						submit_values();
					}}
				/>
			{:else}
				<input
					type="date"
					class="datetime"
					bind:this={datetime1}
					bind:value={datevalue1}
					on:input={() => {
						const date = new Date(datevalue1);
						start_time = format_date(date);
						submit_values();
					}}
				/>
			{/if}

			<button
				class="calendar"
				on:click={() => {
					datetime1.showPicker();
				}}><Calendar></Calendar></button
			>
		</div>
		<div class="timebox">
			<input
				class="end"
				placeholder="To"
				bind:value={end_time}
				class:invalid={!end_time_valid}
				on:keydown={(evt) => {
					if (evt.key === "Enter") {
						submit_values();
						gradio.dispatch("submit");
					}
				}}
				on:blur={submit_values}
			/>
			{#if include_time}
				<input
					type="datetime-local"
					class="datetime"
					step="1"
					bind:this={datetime2}
					bind:value={datevalue2}
					on:input={(evt) => {
						const date = new Date(datevalue2);
						end_time = format_date(date);
						submit_values();
					}}
				/>
			{:else}
				<input
					type="date"
					class="datetime"
					bind:this={datetime2}
					bind:value={datevalue2}
					on:input={(evt) => {
						const date = new Date(datevalue2);
						end_time = format_date(date);
						submit_values();
					}}
				/>
			{/if}
			<button
				class="calendar"
				on:click={() => {
					datetime2.showPicker();
				}}><Calendar></Calendar></button
			>
		</div>
	</div>
</Block>

<style>
	.label-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.quick-ranges {
		display: inline-flex;
		gap: var(--size-3);
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
	.datetimerange {
		display: flex;
		gap: var(--size-2);
		flex-wrap: wrap;
	}
	.timebox {
		flex-grow: 1;
		flex-shrink: 1;
		display: flex;
		position: relative;
		box-shadow: var(--input-shadow);
		background: var(--input-background-fill);
	}
	.timebox :global(svg) {
		height: 18px;
	}
	.start,
	.end {
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
	}
	.start.invalid,
	.end.invalid {
		color: var(--body-text-color-subdued);
	}
	.range-btn,
	.calendar {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: var(--button-transition);
		box-shadow: var(--button-shadow);
		text-align: center;
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		font-weight: var(--button-large-text-weight);
		font-size: var(--button-large-text-size);
	}
	.calendar {
		border-top-right-radius: var(--input-radius);
		border-bottom-right-radius: var(--input-radius);
		padding: var(--size-2);
	}
	.datetime {
		width: 0px;
		padding: 0;
		border: 0;
		margin: 0;
		background: none;
	}
</style>
