<script lang="ts">
	import {
		input_component_map,
		output_component_map
	} from "./components/directory";
	import { deepCopy } from "./components/utils/helpers";
	import ExampleSet from "./ExampleSet.svelte";
	import { _ } from "svelte-i18n";

	interface Component {
		name: string;
		[key: string]: unknown;
	}

	export let input_components: Array<Component>;
	export let output_components: Array<Component>;
	export let theme: string;
	export let fn: (...args: any) => Promise<unknown>;
	export let examples: Array<Array<unknown>>;
	export let examples_per_page: number;
	export let root: string;
	export let allow_flagging: string;
	export let flagging_options: Array<string> | undefined = undefined;
	export let allow_interpretation: boolean;
	export let avg_durations: undefined | Array<number> = undefined;
	export let live: boolean;
	export let queue: boolean;
	export let static_src: string;

	let examples_dir = root + "file/";
	let interpret_mode = false;
	let submission_count = 0;
	let state = "START";
	let last_duration: number | null = null;
	let has_changed = false;
	let queue_index: number | null = null;
	let initial_queue_index: number | null = null;
	let just_flagged: boolean = false;
	let cleared_since_last_submit = false;

	const default_inputs: Array<unknown> = input_components.map((component) =>
		"default" in component ? component.default : null
	);
	const default_outputs = new Array(output_components.length).fill(null);

	let input_values: Array<unknown> = deepCopy(default_inputs);
	let output_values = deepCopy(default_outputs);
	let interpretation_values: Array<unknown> = [];
	let timer: NodeJS.Timeout = null;
	let timer_start = 0;
	let timer_diff = 0;
	let avg_duration = Array.isArray(avg_durations) ? avg_durations[0] : null;
	let expected_duration: number | null = null;
	let example_id: number | null = null;

	const setValues = async (index: number, value: unknown) => {
		example_id = null;
		has_changed = true;
		input_values[index] = value;
		if (live && state !== "PENDING") {
			await submit();
		}
	};

	const setExampleId = async (_id: number) => {
		example_id = _id;
		input_components.forEach(async (input_component, i) => {
			const process_example =
				input_component_map[input_component.name].process_example;
			if (process_example !== undefined) {
				input_values[i] = await process_example(
					examples[example_id][i],
					examples_dir
				);
			} else {
				input_values[i] = examples[example_id][i];
			}
		});
		example_id = _id;
	};

	const startTimer = () => {
		timer_start = Date.now();
		timer_diff = 0;
		timer = setInterval(() => {
			timer_diff = (Date.now() - timer_start) / 1000;
		}, 100);
	};

	const stopTimer = () => {
		clearInterval(timer);
	};

	const submit = async () => {
		if (state === "PENDING") {
			return;
		}
		for (let [i, input_component] of input_components.entries()) {
			if (
				input_values[i] === null &&
				input_component.name !== "state" &&
				input_component.optional !== true
			) {
				return;
			}
		}
		state = "PENDING";
		submission_count += 1;
		has_changed = false;
		let submission_count_at_click = submission_count;
		startTimer();
		let output: any;
		try {
			output = await fn(
				"predict",
				{
					data: input_values,
					cleared: cleared_since_last_submit,
					example_id: example_id
				},
				queue,
				queueCallback
			);
		} catch (e) {
			if (
				state !== "PENDING" ||
				submission_count_at_click !== submission_count
			) {
				return;
			}
			stopTimer();
			console.error(e);
			state = "ERROR";
			output_values = deepCopy(default_outputs);
		}
		if (state !== "PENDING" || submission_count_at_click !== submission_count) {
			return;
		}
		stopTimer();
		output_values = output["data"];
		cleared_since_last_submit = false;
		for (let [i, value] of output_values.entries()) {
			if (output_components[i].name === "state") {
				for (let [j, input_component] of input_components.entries()) {
					if (input_component.name === "state") {
						input_values[j] = value;
					}
				}
			}
		}
		if ("durations" in output) {
			last_duration = output["durations"][0];
		}
		if ("avg_durations" in output) {
			avg_duration = output["avg_durations"][0];
			if (queue && initial_queue_index) {
				expected_duration = avg_duration * (initial_queue_index + 1);
			} else {
				expected_duration = avg_duration;
			}
		}
		state = "COMPLETE";
		if (live && has_changed) {
			await submit();
		}
	};
	const clear = () => {
		input_values = deepCopy(default_inputs);
		output_values = deepCopy(default_outputs);
		interpret_mode = false;
		state = "START";
		cleared_since_last_submit = true;
		stopTimer();
	};
	const flag = (flag_option: string | null) => {
		let flag_data: Record<string, any> = {
			input_data: input_values,
			output_data: output_values
		};
		if (flag_option !== null) {
			flag_data["flag_option"] = flag_option;
		}
		just_flagged = true;
		setTimeout(() => {
			just_flagged = false;
		}, 500);
		fn("flag", {
			data: flag_data
		});
	};
	const interpret = () => {
		if (interpret_mode) {
			interpret_mode = false;
		} else {
			fn(
				"interpret",
				{
					data: input_values
				},
				queue,
				queueCallback
			).then((output) => {
				interpret_mode = true;
				interpretation_values = output.interpretation_scores;
			});
		}
	};

	const queueCallback = (index: number, is_initial: boolean) => {
		if (is_initial) {
			initial_queue_index = index;
		}
		queue_index = index;
	};
</script>

<div class="gradio-interface" {theme}>
	<div class="panels flex flex-wrap justify-center gap-4 flex-col sm:flex-row">
		<div class="panel flex-1">
			<div
				class="component-set p-2 rounded flex flex-col flex-1 gap-2"
				style="min-height: 36px"
			>
				{#each input_components as input_component, i}
					{#if input_component.name !== "state"}
						<div class="component" key={i}>
							<div class="panel-header mb-1.5">
								{input_component.label}{#if input_component.optional}
									&nbsp;<em>(optional)</em>{/if}
							</div>
							<svelte:component
								this={input_component_map[input_component.name][
									interpret_mode ? "interpretation" : "component"
								]}
								{...input_component}
								{theme}
								{static_src}
								{live}
								value={input_values[i]}
								interpretation={interpret_mode
									? interpretation_values[i]
									: null}
								setValue={(value) => setValues(i, value)}
							/>
						</div>
					{/if}
				{/each}
			</div>
			<div class="panel-buttons flex gap-4 my-4">
				<button
					class="panel-button bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
					on:click={clear}
				>
					{$_("interface.clear")}
				</button>
				{#if !live}
					<button
						class="panel-button submit bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
						on:click={submit}
					>
						{$_("interface.submit")}
					</button>
				{/if}
			</div>
		</div>
		<div class="panel flex-1">
			<div
				class="component-set p-2 rounded flex flex-col flex-1 gap-2 relative"
				style="min-height: 36px"
				class:opacity-50={state === "PENDING" && !live}
			>
				{#if state !== "START"}
					<div class="state absolute right-2 flex items-center gap-0.5 text-xs">
						{#if state === "PENDING"}
							<div class="timer font-mono text-right" style="max">
								{timer_diff.toFixed(1)}s
								{#if expected_duration !== null}
									<span>
										(ETA: {expected_duration.toFixed(
											1
										)}s<!--
                    -->{#if queue_index}
											, {queue_index} ahead<!--
                    -->{/if})<!--
                  --></span
									>
								{/if}
							</div>
							<img
								src="{static_src}/static/img/logo.svg"
								alt="Pending"
								class="pending h-5 ml-1 inline-block"
							/>
						{:else if state === "ERROR"}
							<img
								src="{static_src}/static/img/logo_error.svg"
								alt="Error"
								class="error h-5 ml-2 inline-block"
							/>
						{:else if state === "COMPLETE" && last_duration !== null}
							<div class="duration font-mono">{last_duration.toFixed(1)}s</div>
						{/if}
					</div>
				{/if}
				{#each output_components as output_component, i}
					{#if output_values[i] !== null && output_component.name !== "state"}
						<div class="component">
							<div class="panel-header mb-1.5">{output_component.label}</div>
							<svelte:component
								this={output_component_map[output_component.name].component}
								{...output_component}
								{theme}
								{static_src}
								value={output_values[i]}
							/>
						</div>
					{/if}
				{/each}
			</div>
			<div class="panel-buttons flex gap-4 my-4">
				{#if allow_interpretation !== false}
					<button
						class="panel-button flag bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
						on:click={interpret}
					>
						{#if interpret_mode}
							Hide
						{:else}
							{$_("interface.interpret")}
						{/if}
					</button>
				{/if}
				{#if allow_flagging !== "never"}
					{#if flagging_options}
						<button
							class="panel-button group flag relative bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
							class:just_flagged
						>
							{$_("interface.flag")} ▼
							<div
								class="flag-options hidden group-hover:block absolute top-8 left-0 bg-white border-gray-200 border-2 w-full dark:bg-gray-500 dark:border-none"
							>
								{#each flagging_options as option}
									<div
										class="flag-option p-2 transition"
										on:click={() => {
											flag(option);
										}}
									>
										{option}
									</div>
								{/each}
							</div>
						</button>
					{:else}
						<button
							class="panel-button flag bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
							class:just_flagged
							on:click={() => flag(null)}
						>
							{$_("interface.flag")}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</div>
	{#if examples}
		<ExampleSet
			{examples}
			{examples_per_page}
			{example_id}
			{input_components}
			{theme}
			{examples_dir}
			{setExampleId}
		/>
	{/if}
</div>

<style lang="postcss" global>
	.pending {
		@keyframes ld-breath {
			0% {
				animation-timing-function: cubic-bezier(
					0.9647,
					0.2413,
					-0.0705,
					0.7911
				);
				transform: scale(0.9);
			}
			51% {
				animation-timing-function: cubic-bezier(
					0.9226,
					0.2631,
					-0.0308,
					0.7628
				);
				transform: scale(1.2);
			}
			100% {
				transform: scale(0.9);
			}
		}
		animation: ld-breath 0.75s infinite linear;
	}
	.flag-option {
		@apply hover:bg-gray-100;
	}
	.gradio-interface[theme="default"] {
		.component-set {
			@apply bg-gray-50 dark:bg-gray-700 dark:drop-shadow-xl shadow;
		}
		.component {
			@apply mb-2;
		}
		.panel-header {
			@apply uppercase text-xs;
		}
		.panel-button {
			@apply hover:bg-gray-100 dark:hover:bg-gray-600 shadow;
		}
		.panel-button.disabled {
			@apply text-gray-400 cursor-not-allowed;
		}
		.panel-button.submit {
			@apply bg-amber-500 hover:bg-amber-400 dark:bg-red-700 dark:hover:bg-red-600 text-white;
		}
		.panel-button.just_flagged {
			@apply bg-red-300 hover:bg-red-300;
		}
		.examples {
			.examples-table-holder:not(.gallery) {
				@apply shadow;
				.examples-table {
					@apply rounded dark:bg-gray-700;
					thead {
						@apply border-gray-300 dark:border-gray-600;
					}
					tbody tr:hover {
						@apply bg-amber-500 dark:bg-red-700 text-white;
					}
				}
			}
			.examples-table-holder.gallery .examples-table {
				tbody td {
					@apply shadow;
				}
				tbody td:hover {
					@apply bg-amber-500 text-white;
				}
			}
		}
	}
</style>
