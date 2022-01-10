<script>
  import Interface from "./Interface.svelte";

  export let title;
  export let description;
  export let theme;
  export let input_components;
  export let output_components;
  export let fn;
</script>

<div
  class="gradio-bg flex flex-col dark:bg-gray-600 {window.gradio_mode === 'app'
    ? 'h-full'
    : 'h-auto'}"
  {theme}
>
  <div
    class="gradio-page container mx-auto flex flex-col box-border flex-grow text-gray-700 dark:text-gray-50"
  >
    <div class="content pt-4 px-4 mb-4">
      {#if title}
        <h1 class="title text-center p-4 text-4xl">{title}</h1>
      {/if}
      {#if description}
        <p class="description pb-4">{description}</p>
      {/if}
      <Interface {input_components} {output_components} {theme} {fn} />
    </div>
  </div>
</div>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
