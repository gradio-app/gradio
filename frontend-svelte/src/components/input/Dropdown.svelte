<script>
  export let value, setValue, theme;
  export let choices;
</script>

<div class="input-dropdown group inline-block relative" {theme}>
  <button
    class="selector py-2 px-3 font-semibold rounded inline-flex items-center"
  >
    {value}
    <svg class="caret ml-2 fill-current h-4 w-4" viewBox="0 0 20 20">
      <path
        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
      />
    </svg>
  </button>
  <div
    class="dropdown-menu-holder absolute hidden group-hover:block pt-1 z-10 bg-none"
  >
    <ul class="dropdown-menu max-h-80 overflow-y-auto">
      {#each choices as choice, i}
        <li
          class="dropdown-item first:rounded-t transition last:rounded-b py-2 px-3 block whitespace-nowrap cursor-pointer"
          on:click={() => setValue(choice)}
          key={i}
        >
          {choice}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="postcss">
  .input-dropdown[theme="default"] {
    .selector {
      @apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
    }
    .dropdown-menu {
      @apply shadow;
    }
    .dropdown-item {
      @apply bg-white dark:bg-gray-800 hover:bg-yellow-500 dark:hover:bg-red-600 hover:text-gray-50 hover:font-semibold;
    }
  }
</style>
