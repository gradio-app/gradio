<script>
  import { getSaliencyColor } from "../../utils/helpers";

  export let value, interpretation, theme;
</script>

<div class="input-number">
  <div class="interpret_range flex">
    {#each interpretation as interpret_value}
      <div
        class="flex-1"
        style={"background-color: " + getSaliencyColor(interpret_value[1])}
      >
        {interpret_value[0]}
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  .input-number[theme="default"] {
    @apply shadow transition hover:shadow-md dark:bg-gray-800;
  }
</style>
