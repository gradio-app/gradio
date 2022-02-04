<script>
  import Cropper from "../../utils/Cropper.svelte";

  import Upload from "../../utils/Upload.svelte";
  import ModifyUpload from "../../utils/ModifyUpload.svelte";
  import ModifySketch from "../../utils/ModifySketch.svelte";
  import ImageEditor from "../../utils/ImageEditor.svelte";
  import Sketch from "../../utils/Sketch.svelte";
  import Webcam from "../../utils/Webcam.svelte";
  export let value, setValue, theme, static_src;
  export let source = "upload";
  export let tool = "editor";

  let mode;
  let sketch;

  function handle_save({ detail }) {
    setValue(detail);
    mode = "view";
  }
</script>

<div class="input-image">
  <div
    class="image-preview w-full h-80 flex justify-center items-center dark:bg-gray-600 relative"
    class:bg-gray-200={value}
    class:h-80={source !== "webcam"}
  >
    {#if source === "canvas"}
      <ModifySketch
        on:undo={() => sketch.undo()}
        on:clear={() => sketch.clear()}
      />
      <Sketch
        {value}
        bind:this={sketch}
        on:change={({ detail }) => setValue(detail)}
      />
    {:else if value === null}
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
      {:else if source === "webcam"}
        <Webcam on:capture={({ detail }) => setValue(detail)} {static_src} />
      {/if}
    {:else if tool === "select"}
      <Cropper image={value} on:crop={({ detail }) => setValue(detail)} />
    {:else if tool === "editor"}
      {#if mode === "edit"}
        <ImageEditor
          {value}
          on:cancel={() => (mode = "view")}
          on:save={handle_save}
        />
      {/if}
      <ModifyUpload
        edit={() => (mode = "edit")}
        clear={() => setValue(null)}
        {theme}
        {static_src}
      />

      <img class="w-full h-full object-contain" src={value} alt="" />
    {/if}
  </div>
</div>

<style lang="postcss">
  :global(.image_editor_buttons) {
    width: 800px;
    @apply flex justify-end gap-1;
  }
  :global(.image_editor_buttons button) {
    @apply px-2 py-1 text-xl bg-black text-white font-semibold rounded-t;
  }
  :global(.tui-image-editor-header-buttons) {
    @apply hidden;
  }
  :global(.tui-colorpicker-palette-button) {
    width: 12px;
    height: 12px;
  }
</style>
