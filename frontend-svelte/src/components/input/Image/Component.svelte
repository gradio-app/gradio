<script>
  import Cropper from "./Cropper.svelte";

  import Upload from "../utils/Upload.svelte";
  import ModifyUpload from "../utils/ModifyUpload.svelte";
  import ImageEditor from "../utils/ImageEditor.svelte";

  export let value, setValue, theme;
  export let source = "upload";
  export let tool = "editor";

  let editor;
  let el;
  let mode;

  // const create_editor = () => {
  //   editor = new ImageEditor(el, {
  //     usageStatistics: false,
  //     includeUI: {
  //       loadImage: {
  //         path: value,
  //         name: "Edit Image",
  //       },

  //       menu: ["shape", "filter"],
  //       initMenu: "filter",
  //       uiSize: {
  //         width: "1000px",
  //         height: "700px",
  //       },
  //       menuBarPosition: "bottom",
  //     },
  //     cssMaxWidth: 700,
  //     cssMaxHeight: 500,
  //     selectionStyle: {
  //       cornerSize: 20,
  //       rotatingPointOffset: 70,
  //     },
  //   });
  // };

  function handle_save({ detail }) {
    setValue(detail);
    mode = "view";
  }
</script>

<div class="input-image">
  <div
    class="image-preview w-full h-80 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
  >
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
      <Cropper image={value} on:crop={({ detail }) => setValue(detail)} />
      <!-- svelte-ignore a11y-missing-attribute -->
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
      />
      <!-- svelte-ignore a11y-missing-attribute -->
      <img class="w-full h-full object-contain" src={value} bind:this={el} />
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
