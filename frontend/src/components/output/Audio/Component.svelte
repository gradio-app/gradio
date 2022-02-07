<script>
  import { afterUpdate } from "svelte";

  export let value, theme;
  let audio;

  afterUpdate(() => audio.src = value)
</script>

<audio bind:this={audio} class="w-full" {theme} controls>
  <source src={value} />
</audio>

<style lang="postcss">
</style>
