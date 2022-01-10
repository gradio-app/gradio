<script>
  import Upload from "../utils/Upload.svelte";
  import { prettyBytes } from "../utils/helpers";

  export let value, setValue, theme;
</script>

<div class="input-file" {theme}>
  {#if value === null}
    <Upload load={setValue} {theme}>
      Drop File Here
      <br />- or -<br />
      Click to Upload
    </Upload>
  {:else}
    <div class="file-preview w-full flex flex-col justify-center items-center relative">
      <div class="file-name text-4xl p-6 break-all">{value.name}</div>
      <div class="file-size text-2xl p-2">
        {prettyBytes(value.size)}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .input-file[theme="default"] .file-preview {
      @apply h-60;
  }
</style>
