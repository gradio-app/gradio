<script>
  export let edit, clear, theme;
  export let absolute = true;
</script>

<div class="modify-upload z-10 top-0 right-0 flex justify-end" class:absolute {theme}>
  {#if edit}
    <button
      class="edit bg-opacity-30 hover:bg-opacity-100 transition p-1"
      on:click={edit}
    >
      <img
        class="h-4 filter dark:invert"
        src="static/img/edit.svg"
        alt="Edit"
      />
    </button>
  {/if}
  <button
    class="clear bg-opacity-30 hover:bg-opacity-100 transition p-1"
    on:click={clear}
  >
    <img
      class="h-4 filter dark:invert"
      src="static/img/clear.svg"
      alt="Clear"
    />
  </button>
</div>

<style lang="postcss">
  .modify-upload[theme="default"] {
    @apply m-1 flex gap-1;
    .edit {
      @apply bg-yellow-500 dark:bg-red-600 rounded shadow;
    }
    .clear {
      @apply bg-gray-50 dark:bg-gray-500 rounded shadow;
    }
  }
</style>
