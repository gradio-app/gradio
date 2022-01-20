<script>
  export let value, theme;
</script>

<div class="output-label" {theme}>
  <div
    class="output-class font-bold text-2xl py-6 px-4 flex-grow flex items-center justify-center"
    class:no-confidence={!("confidences" in value)}
  >
    {value.label}
  </div>
  {#if "confidences" in value}
    <div class="confidence-intervals flex text-xl">
      <div class="labels mr-2" style={{ maxWidth: "120px" }}>
        {#each value.confidences as confidence_set, i}
          <div
            class="label overflow-hidden whitespace-nowrap h-7 mb-2 overflow-ellipsis text-right"
            title={confidence_set.label}
            key={i}
          >
            {confidence_set.label}
          </div>
        {/each}
      </div>
      <div class="confidences flex flex-grow flex-col items-baseline">
        {#each value.confidences as confidence_set, i}
          <div
            class="confidence flex justify-end overflow-hidden whitespace-nowrap h-7 mb-2 px-1"
            style={"min-width: calc(" +
              Math.round(confidence_set.confidence * 100) +
              "% - 12px)"}
            key={i}
          >
            {Math.round(confidence_set.confidence * 100) + "%"}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .output-label[theme="default"] {
    .label {
      @apply text-base h-7;
    }
    .confidence {
      @apply font-mono box-border border-b-2 border-gray-300 bg-gray-200 dark:bg-gray-500 dark:border-gray-600 text-sm h-7 font-semibold rounded;
    }
    .confidence:first-child {
      @apply border-yellow-600 bg-yellow-500 dark:bg-red-600 border-red-700 text-white;
    }
  }
</style>
