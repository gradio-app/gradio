<script>
  import { prettyBytes } from "../utils/helpers";

  export let value, theme;
</script>

<a
  class="output-file w-full h-full flex flex-col justify-center items-center relative"
  href={value.data}
  download={value.name}
  {theme}
>
  <div class="file-name text-4xl p-6 break-all">{value.name}</div>
  <div class="text-2xl p-2">
    {isNaN(value.size) ? "" : prettyBytes(value.size)}
  </div>
</a>

<style lang="postcss">
  .output-file[theme="default"] {
    @apply h-60 hover:text-gray-500;
  }
</style>
