<script>
  import Upload from "../../utils/Upload.svelte";
  import ModifyUpload from "../../utils/ModifyUpload.svelte";
  import { prettyBytes, playable } from "../../utils/helpers";

  export let value, setValue, theme, static_src;
  export let source;
</script>

<div
  class="video-preview w-full h-80 object-contain flex justify-center items-center  dark:bg-gray-600 relative"
  class:bg-gray-200={value}
>
  {#if value === null}
    {#if source === "upload"}
      <Upload filetype="video/mp4,video/x-m4v,video/*" load={setValue} {theme}>
        Drop Video Here
        <br />- or -<br />
        Click to Upload
      </Upload>
    {/if}
  {:else}
    <ModifyUpload clear={() => setValue(null)} {theme} {static_src} />
    {#if playable(value.name)}
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        class="w-full h-full object-contain bg-black"
        controls
        playsInline
        preload
        src={value.data}
      />
    {:else}
      <div class="file-name text-4xl p-6 break-all">{value.name}</div>
      <div class="file-size text-2xl p-2">
        {prettyBytes(value.size)}
      </div>
    {/if}
  {/if}
</div>

<style lang="postcss">
</style>
