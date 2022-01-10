<script>
  import Upload from "../utils/Upload.svelte";

  export let value, setValue, theme;
  export let source;
  let recording = false;

  const startRecording = () => {};
  const stopRecording = () => {};
</script>

<div class="input-audio">
  {#if value === null}
    {#if source === "microphone"}
      {#if recording}
        <button class="stop" onClick={stopRecording}> Recording... </button>
      {:else}
        <button class="start" onClick={startRecording}> Record </button>
      {/if}
    {:else if source === "upload"}
      <Upload filetype="audio/*" load={setValue} {theme}>
        Drop Audio Here
        <br />- or -<br />
        Click to Upload
      </Upload>
    {/if}
  {:else}
    <audio controls>
      <source src={value.data} />
    </audio>
  {/if}
</div>

<style lang="postcss">
</style>
