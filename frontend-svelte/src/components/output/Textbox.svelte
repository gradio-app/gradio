<script>
  export let value, theme;
</script>

<div
  class="output-text w-full bg-white dark:bg-gray-800 rounded box-border p-2 whitespace-pre-wrap"
  {theme}
>
  {value}
</div>

<style lang="postcss">
  .output-text[theme="default"] {
    @apply shadow transition hover:shadow-md dark:bg-gray-800;
  }
</style>
