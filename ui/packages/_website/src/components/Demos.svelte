<script>
    import { svgCopy, svgCheck } from "../assets/copy.js";
    

    export let name;
    export let code;

    let code_elem = "";
     
    let copied = false;
    function copy(code_elem) {
      let code_text = code_elem.textContent;
      navigator.clipboard.writeText(code_text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }

</script>


<div class="codeblock bg-gray-50 mx-auto p-3 my-3" id="{ name }_code">
    <a class ="clipboard-button" href="https://colab.research.google.com/github/gradio-app/gradio/blob/main/demo/{ name }/run.ipynb" target="_blank" style="right:30px">
      <img src="https://colab.research.google.com/assets/colab-badge.svg">
    </a>
    <button class="clipboard-button" type="button" on:click={() => copy(code_elem)}>
      {#if !copied }
        {@html svgCopy }
      {:else}
        {@html svgCheck }
      {/if}
    </button>
<pre class=" max-h-80 overflow-auto"><code
    bind:this={code_elem}
  class="code language-python">{@html code}</code>
</pre>
</div>


<gradio-app space={"gradio/" + name} />
