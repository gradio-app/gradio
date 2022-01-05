<script>
  import {
    inputComponentMap,
    outputComponentMap,
  } from "./components/directory.js";

  export let input_components;
  export let output_components;
  export let theme;
  export let fn;

  let input_values = input_components.map((component) =>
    "default" in component ? component.default : null
  );
  let output_values = new Array(output_components.length).fill(null);

  const setValues = (index, value) => {
    input_values[index] = value;
  };
  const submit = () => {
    fn("predict", { data: input_values }).then((output) => {
      output_values = output["data"];
    });
  };
  const clear = () => {};
</script>

<div class="gradio-interface" {theme}>
  <div class="panels flex flex-wrap justify-center gap-4">
    <div class="panel flex-1">
      <div
        class="component-set p-2 rounded flex flex-col flex-1 gap-2"
        style="min-height: 36px"
      >
        {#each input_components as input_component, i}
          <div class="component" key={i}>
            <div class="panel-header mb-1.5">{input_component.label}</div>
            <svelte:component
              this={inputComponentMap[input_component.name]}
              {...input_component}
              {theme}
              value={input_values[i]}
              setValue={setValues.bind(this, i)}
            />
          </div>
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
        class="component-set p-2 rounded flex flex-col flex-1 gap-2"
        style="min-height: 36px"
      >
        {#each output_components as output_component, i}
          {#if output_values[i] !== null}
            <div class="component" key={i}>
              <div class="panel-header mb-1.5">{output_component.label}</div>
              <svelte:component
              this={outputComponentMap[output_component.name]}
              {...output_component}
              {theme}
              value={output_values[i]}
            />
            </div>
          {/if}
        {/each}
      </div>
      <div class="panel-buttons flex gap-4 my-4">
        <button
          class="panel-button flag bg-gray-50 dark:bg-gray-700 flex-1 p-3 rounded transition font-semibold focus:outline-none"
          >Flag</button
        >
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
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
  }
</style>
