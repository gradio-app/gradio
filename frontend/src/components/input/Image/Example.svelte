<script>
  export let value, examples_dir;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="input-image-example h-24 max-w-none" src={examples_dir + value} />
