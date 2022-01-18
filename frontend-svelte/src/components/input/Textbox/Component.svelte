<script>
  export let value, setValue, theme;
  export let lines, placeholder;
</script>

{#if lines > 1}
  <textarea
    class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
    {value}
    {placeholder}
    on:change={(e) => setValue(e.target.value)}
    {theme}
  />
{:else}
  <input
    type="text"
    class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
    {value}
    {placeholder}
    on:change={(e) => setValue(e.target.value)}
    {theme}
  />
{/if}

<style lang="postcss">
  .input-text[theme="default"] {
    @apply shadow transition hover:shadow-md dark:bg-gray-800;
  }
</style>
