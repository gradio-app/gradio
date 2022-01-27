<script>
  import JsonNode from "./JsonNode.svelte";

  export let value, theme;
</script>

<div class="output-json font-mono leading-relaxed" {theme}>
  <JsonNode {value} depth={0} {theme} />
</div>

<style lang="postcss" global>
  .output-text[theme="default"] {
    @apply shadow transition hover:shadow-md dark:bg-gray-800;
  }
</style>
