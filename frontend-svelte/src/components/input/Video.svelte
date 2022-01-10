<script>
  import Upload from "../utils/Upload.svelte";
  import { prettyBytes, playable } from "../utils/helpers";

  export let value, setValue, theme;
  export let source;

</script>

<div class="input-video">
  {#if value === null}
    {#if source === "upload"}
      <Upload filetype="video/mp4,video/x-m4v,video/*" load={setValue} {theme}>
        Drop Video Here
        <br />- or -<br />
        Click to Upload
      </Upload>
    {/if}
  {:else}
    <div
      class="video-preview w-full h-60 object-contain flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
    >
      {#if playable(value.name)}
        <video
          class="video_preview"
          controls
          playsInline
          preload
          src={value.data}
        />
      {:else}
      <div class="file-preview h-60 w-full flex flex-col justify-center items-center relative">
        <div class="file-name text-4xl p-6 break-all">{value.name}</div>
        <div class="file-size text-2xl p-2">
          {prettyBytes(value.size)}
        </div>
      </div>
  
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
</style>
