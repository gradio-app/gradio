<script>
  import Cropper from "./Cropper.svelte";

  import Upload from "../utils/Upload.svelte";
  import ModifyUpload from "../utils/ModifyUpload.svelte";

  export let value, setValue, theme;
  export let source = "upload";
  export let tool = "editor";
</script>

<div class="input-image">
  {#if value === null}
    {#if source === "upload"}
      <Upload
        filetype="image/x-png,image/gif,image/jpeg"
        load={setValue}
        include_file_metadata={false}
        {theme}
      >
        Drop Image Here
        <br />- or -<br />
        Click to Upload
      </Upload>
    {/if}
  {:else if tool === "select"}
    <div
      class="image-preview w-full h-80  bg-gray-200 dark:bg-gray-600 relative"
    >
      <Cropper image={value} />
      <!-- svelte-ignore a11y-missing-attribute -->
    </div>
  {:else}
    <div
      class="image-preview w-full h-80 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
    >
      <ModifyUpload
        edit={() => setValue(null)}
        clear={() => setValue(null)}
        {theme}
      />
      <!-- svelte-ignore a11y-missing-attribute -->
      <img class="w-full h-full object-contain" src={value} />
    </div>
  {/if}
</div>

<style lang="postcss">
</style>
