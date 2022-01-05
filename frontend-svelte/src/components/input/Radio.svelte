<script>
  export let value, setValue, theme;
  export let choices;
</script>

<div class="input-radio flex flex-wrap gap-2" {theme}>
  {#each choices as choice, i}
    <div
      class="radio-item py-2 px-3 font-semibold rounded cursor-pointer flex items-center gap-2"
      class:selected={value === choice}
      key={i}
      on:click={() => setValue(choice)}
    >
      <div class="radio-circle w-4 h-4 rounded-full box-border" />
      {choice}
    </div>
  {/each}
</div>

<style lang="postcss">
  .input-radio[theme="default"] {
    .radio-item {
      @apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
    }
    .radio-circle {
      @apply bg-gray-50 dark:bg-gray-400 border-4 border-gray-200 dark:border-gray-600;
    }
    .radio-item.selected {
      @apply bg-yellow-500 dark:bg-red-600 text-white shadow;
    }
    .radio-circle {
      @apply w-4 h-4 bg-white transition rounded-full box-border;
    }
    .selected .radio-circle {
      @apply border-yellow-600 dark:border-red-700;
    }
  }
</style>
