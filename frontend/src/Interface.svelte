<script>
  import { init } from "svelte/internal";

  import {
    input_component_map,
    output_component_map,
  } from "./components/directory.js";
  import { deepCopy } from "./components/utils/helpers.js";
  import ExampleSet from "./ExampleSet.svelte";

  export let input_components,
    output_components,
    theme,
    fn,
    examples,
    root,
    allow_flagging,
    allow_interpretation,
    avg_durations,
    live,
    queue,
    static_src;

  let examples_dir = root + "file/";
  let interpret_mode = false;
  let submission_count = 0;
  let state = "START";
  let last_duration = null;
  let has_changed = false;
  let queue_index = null;
  let initial_queue_index = null;

  const default_inputs = input_components.map((component) =>
    "default" in component ? component.default : null
  );
  const default_outputs = new Array(output_components.length).fill(null);

  let input_values = deepCopy(default_inputs);
  let output_values = deepCopy(default_outputs);
  let interpretation_values = [];
  let timer = null;
  let timer_start = 0;
  let timer_diff = 0;
  let avg_duration = Array.isArray(avg_durations)
    ? this.props.avg_durations[0]
    : null;
  let expected_duration = null;

  const setValues = (index, value) => {
    has_changed = true;
    input_values[index] = value;
    if (live && state !== "PENDING") {
      submit();
    }
  };
  const setExampleId = async (example_id) => {
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
  const submit = () => {
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
    fn("predict", { data: input_values }, queue, queueCallback)
      .then((output) => {
        if (
          state !== "PENDING" ||
          submission_count_at_click !== submission_count
        ) {
          return;
        }
        stopTimer();
        output_values = output["data"];
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
          submit();
        }
      })
      .catch((e) => {
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
      });
  };
  const clear = () => {
    input_values = deepCopy(default_inputs);
    output_values = deepCopy(default_outputs);
    interpret_mode = false;
    state = "START";
    stopTimer();
  };
  const flag = () => {
    fn("flag", {
      data: {
        input_data: input_values,
        output_data: output_values,
      },
    });
  };
  const interpret = () => {
    if (interpret_mode) {
      interpret_mode = false;
    } else {
      fn(
        "interpret",
        {
          data: input_values,
        },
        queue,
        queueCallback
      ).then((output) => {
        interpret_mode = true;
        interpretation_values = output.interpretation_scores;
      });
    }
  };
  const queueCallback = (index, is_initial) => {
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
              <div class="panel-header mb-1.5">{input_component.label}</div>
              <svelte:component
                this={input_component_map[input_component.name][
                  interpret_mode ? "interpretation" : "component"
                ]}
                {...input_component}
                {theme}
                value={input_values[i]}
                interpretation={interpret_mode
                  ? interpretation_values[i]
                  : null}
                setValue={setValues.bind(this, i)}
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
          Clear
        </button>
        <button
          class="panel-button submit bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
          on:click={submit}
        >
          Submit
        </button>
      </div>
    </div>
    <div class="panel flex-1">
      <div
        class="component-set p-2 rounded flex flex-col flex-1 gap-2 relative"
        style="min-height: 36px"
        class:opacity-50={state === "PENDING"}
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
          {#if output_values[i] !== null}
            <div class="component" key={i}>
              <div class="panel-header mb-1.5">{output_component.label}</div>
              <svelte:component
                this={output_component_map[output_component.name].component}
                {...output_component}
                {theme}
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
              Interpret
            {/if}
          </button>
        {/if}
        {#if allow_flagging !== "never"}
          <button
            class="panel-button flag bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
            on:click={flag}
          >
            Flag
          </button>
        {/if}
      </div>
    </div>
  </div>
  {#if examples}
    <ExampleSet
      {examples}
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
      @apply bg-yellow-500 hover:bg-yellow-400 dark:bg-red-700 dark:hover:bg-red-600 text-white;
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
            @apply bg-yellow-500 dark:bg-red-700 text-white;
          }
        }
      }
      .examples-table-holder.gallery .examples-table {
        tbody td {
          @apply shadow;
        }
        tbody td:hover {
          @apply bg-yellow-500 text-white;
        }
      }
    }
  }
  .gradio-interface[theme="huggingface"] {
  }
</style>
