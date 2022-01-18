<script>
  import { onDestroy } from "svelte";
  import Upload from "../utils/Upload.svelte";
  import ModifyUpload from "../utils/ModifyUpload.svelte";

  export let value, setValue, theme;
  export let source;

  let recording = false;
  let recorder;
  let mode = "";
  let audio_chunks = [];
  let audio_blob;

  let inited = false;

  function blob_to_data_url(blob) {
    return new Promise((fulfill, reject) => {
      let reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => fulfill(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function prepare_audio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (event) => {
      audio_chunks.push(event.data);
    });

    recorder.addEventListener("stop", async () => {
      audio_blob = new Blob(audio_chunks, { type: "audio/wav; codecs=MS_PCM" });
      setValue(await blob_to_data_url(audio_blob));
      recording = false;
    });
  }

  async function record() {
    recording = true;
    audio_chunks = [];

    if (!inited) await prepare_audio();

    recorder.start();
  }

  onDestroy(() => {
    if (recorder) {
      recorder.stop();
    }
  });

  const stop = () => {
    recorder.stop();
  };
</script>

<div class="input-audio">
  {#if value === null}
    {#if source === "microphone"}
      {#if recording}
        <button
          class="p-2 rounded font-semibold bg-red-200 text-red-500 dark:bg-red-600 dark:text-red-100 shadow transition hover:shadow-md"
          on:click={stop}
        >
          Stop Recording
        </button>
      {:else}
        <button
          class="p-2 rounded font-semibold bg-white dark:bg-gray-600 shadow transition hover:shadow-md bg-white dark:bg-gray-800"
          on:click={record}
        >
          Record
        </button>
      {/if}
    {:else if source === "upload"}
      <Upload filetype="audio/*" load={setValue} {theme}>
        Drop Audio Here
        <br />- or -<br />
        Click to Upload
      </Upload>
    {/if}
  {:else}
    <ModifyUpload
      clear={() => setValue(null)}
      edit={() => (mode = "edit")}
      absolute={false}
      {theme}
    />

    <audio class="w-full" controls>
      <source src={value} />
    </audio>
  {/if}
</div>

<style lang="postcss">
</style>
