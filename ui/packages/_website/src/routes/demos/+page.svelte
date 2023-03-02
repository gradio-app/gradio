<script>
    import { afterUpdate } from 'svelte';
    import demos_by_category from "./demos.json"
    import space_logo from "../../assets/img/spaces-logo.svg";
    import DemoCode from '../../components/DemoCode.svelte';
    
    let current_selection = 0;
    let gradio_targets = {};
    
    afterUpdate(() => {  
      for (const key in gradio_targets) {
        if (!gradio_targets[key].firstChild) {
        let embed = document.createElement('gradio-app');
        embed.setAttribute('space', `gradio/${key}`);
        gradio_targets[key].appendChild(embed);
        }
      } 
    }); 
</script>


<main class="container mx-auto px-4 gap-4">
    <h2 class="text-4xl font-light mb-2 pt-2 text-orange-500 group">Demos</h2>
    <p class="mt-8 mb-4 text-lg text-gray-600" >Here are some examples of what you can build with Gradio in just a few lines of Python. Once you’re ready to learn, head over to the <a class="link text-black" target="_blank" href="/getting_started">⚡ Quickstart</a>.</p>
      <p class="mt-4 mb-8 text-lg text-gray-600">Check out more demos on <a class="link text-black" target="_blank" href="https://huggingface.co/spaces"><img class="inline-block my-0 mx-auto w-5 max-w-full pb-1" src={space_logo}> Spaces</a>.</p>
      {#each demos_by_category as {category, demos} (category)}
    
      <div class="category mb-8">
        <h2 class="mb-4 text-2xl font-thin block">{category}</h2>
        <div>
          <div class="demo-window overflow-y-auto h-full w-full my-4">
            <div class="relative mx-auto my-auto rounded-md bg-white" style="top: 5%; height: 90%">
              <div class="flex overflow-auto pt-4">
                {#each demos as  demo , i}
                    <button 
                    on:click={() => (current_selection = i)}
                    class:selected-demo-tab={current_selection == i}
                    class="demo-btn px-4 py-2 text-lg min-w-max text-gray-600 hover:text-orange-500"
                    >{ demo.name }</button>
                {/each}
              </div>
              {#each demos as demo , i}
              <div 
              class:hidden={current_selection !== i }
              class:selected-demo-window={current_selection == i}
              class="demo-content px-4">

                <DemoCode name={demo.dir} code={demo.code} />

                <div bind:this={gradio_targets[demo.dir]} class="gradio-target"></div>

              </div>
              {/each}
            </div>
          </div> 
        </div>
      </div>
     {/each}
    </main>

    <style>
        .code {
          white-space: pre-wrap;
        }
    </style>


