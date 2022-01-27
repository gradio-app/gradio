<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="z-50 top-0 right-0 flex justify-end m-1 flex gap-1 absolute">
  <button
    class="bg-opacity-30 hover:bg-opacity-100 transition p-1 bg-yellow-500 dark:bg-red-600 rounded shadow"
    on:click={() => dispatch("undo")}
  >
    undo
  </button>
  <button
    class="clear bg-opacity-30 hover:bg-opacity-100 transition p-1 bg-gray-50 dark:bg-gray-500 rounded shadow"
    on:click={() => dispatch("clear")}
  >
    clear
  </button>
</div>
