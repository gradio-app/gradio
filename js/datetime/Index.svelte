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
	export let label = "Time";
	export let show_label = true;
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	let old_value = value;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;

	export let include_time = true;
	$: if (value !== old_value) {
		old_value = value;
		entered_value = value;
		datevalue = value;
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
		}
		return date_str;
	};

	let entered_value = value;
	let datetime: HTMLInputElement;
	let datevalue = value;

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

	$: valid = date_is_valid_format(entered_value);

	const submit_values = (): void => {
		if (entered_value === value) return;
		if (!date_is_valid_format(entered_value)) return;
		old_value = value = entered_value;
		gradio.dispatch("change");
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
	</div>
	<div class="timebox">
		<input
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
		/>
		{#if include_time}
			<input
				type="datetime-local"
				class="datetime"
				step="1"
				bind:this={datetime}
				bind:value={datevalue}
				on:input={() => {
					const date = new Date(datevalue);
					entered_value = format_date(date);
					submit_values();
				}}
			/>
		{:else}
			<input
				type="date"
				class="datetime"
				step="1"
				bind:this={datetime}
				bind:value={datevalue}
				on:input={() => {
					const date = new Date(datevalue);
					entered_value = format_date(date);
					submit_values();
				}}
			/>
		{/if}

		<button
			class="calendar"
			on:click={() => {
				datetime.showPicker();
			}}><Calendar></Calendar></button
		>
	</div>
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
	.time.invalid {
		color: var(--body-text-color-subdued);
	}
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
		border-top-right-radius: var(--input-radius);
		border-bottom-right-radius: var(--input-radius);
		padding: var(--size-2);
		border: var(--input-border-width) solid var(--input-border-color);
	}
	.calendar:hover {
		background: var(--button-secondary-background-fill-hover);
	}
	.calendar:active {
		box-shadow: var(--button-shadow-active);
	}
	.datetime {
		width: 0px;
		padding: 0;
		border: 0;
		margin: 0;
		background: none;
	}
</style>
