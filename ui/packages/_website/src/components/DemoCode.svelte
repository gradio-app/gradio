<script>
    import Prism from 'prismjs';
    import 'prismjs/components/prism-python';
    import { svgCopy, svgCheck } from "../assets/copy.js";
    let language = 'python';

    export let name;
    export let code;

    let copied = false;
    function copy(code) {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }

</script>

<div class="codeblock bg-gray-50 mx-auto p-3 my-3" id="{ name }_code">
    <a class ="clipboard-button" href="https://colab.research.google.com/github/gradio-app/gradio/blob/main/demo/{ name }/run.ipynb" target="_blank" style="right:30px">
      <img src="https://colab.research.google.com/assets/colab-badge.svg">
    </a>
    <button class="clipboard-button" type="button" on:click={() => copy(code)}>
      {#if !copied }
        {@html svgCopy }
      {:else}
        {@html svgCheck }
      {/if}
    </button>
<pre class=" max-h-80 overflow-auto"><code class="code language-python">{@html Prism.highlight(code, Prism.languages[language])}</code></pre>
</div>