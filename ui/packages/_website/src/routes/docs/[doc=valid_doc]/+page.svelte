<script>
    import { page } from '$app/stores';
    import docs_json from "../docs.json";
    import { onMount, afterUpdate } from 'svelte';
	import Demos from '../../../components/Demos.svelte';
    import DocsNav from '../../../components/DocsNav.svelte';


    let name = $page.params.doc;
    let obj;
    let mode;

    let docs = docs_json.docs;
    let components = docs.components;

    let gradio_targets = {};

    for (const key in docs) {
        for (const o in docs[key]) {
            if (o == name) {
                obj = docs[key][o];
                mode = key;
            }
        }
    }

    afterUpdate(() => {  
      for (const key in gradio_targets) {
        if (!gradio_targets[key].firstChild) {
        let embed = document.createElement('gradio-app');
        embed.setAttribute('space', `gradio/${key}`);
        gradio_targets[key].appendChild(embed);
        }
      } 
    }); 

    $:  name = $page.params.doc;
    $: for (const key in docs) {
        for (const o in docs[key]) {
            if (o == name) {
                obj = docs[key][o];
                mode = key;
            }
        }
    }
    $: gradio_targets

</script>


<main class="container mx-auto px-4 flex gap-4">

    <DocsNav />
    
    <div class="flex flex-col w-full min-w-full	lg:w-10/12 lg:min-w-0">
        <div>
          <p class="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit float-left">
            New to Gradio? Start here: <a class="link" href="/quickstart">Getting Started</a>
          </p>
          <p class="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 px-4 py-1 rounded-full text-green-800 mb-1 w-fit float-left sm:float-right">
            See the <a class="link" href="/changelog">Release History</a>
          </p>
        </div>

        <div class="flex justify-between mt-4">
            {#if obj.prev_obj}
              <a href="/docs/{ obj.prev_obj.toLowerCase() }"
                 class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline">
                <div class="text-lg"><span class="text-orange-500">&#8592;</span> { obj.prev_obj }</div>
              </a>
            {:else }
              <div></div>
            {/if}
            {#if obj.next_obj}
              <a href="/docs/{ obj.next_obj.toLowerCase() }"
                 class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
                <div class="text-lg">{ obj.next_obj } <span class="text-orange-500">&#8594;</span></div>
              </a>
            {:else }
              <div></div>
            {/if}
        </div>
        
        <div class="obj" id={ obj.name.toLowerCase() }>
            
            <div class="flex flex-row items-center justify-between"> 
                <h3 id="{ obj.name.toLowerCase }-header" class="text-3xl font-light py-4">{ obj.name }</h3>
            </div>
            
            {#if obj.override_signature }
                <div class="codeblock  bg-gray-50 mx-auto p-3"><pre><code class="code language-python">{ obj.override_signature }</code></pre></div> 
            {:else }
                <div class="codeblock  bg-gray-50 mx-auto p-3"><pre><code class="code language-python">{obj.parent}.<span>{ obj.name }&lpar;</span><!--
                -->{#each obj.parameters as param }<!--
                  -->{#if !("kwargs" in param) && !("default" in param) && (param.name != "self") }<!--
                    -->{ param.name }, <!--
                  -->{/if}<!--
                -->{/each}<!--  
                -->···<span>&rpar;</span></code></pre></div> 
            {/if}
            
            {#if mode === "components"}
                <div class="embedded-component">
                    <div bind:this={gradio_targets[obj.name.toLowerCase() + "_component"]} class="gradio-target"></div>
                </div>
            {/if}

            <p class="mt-8 mb-2 text-lg">{@html obj.description }</p>

            {#if mode === "components" }
                    <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">As input: </span> {@html obj.preprocessing }</p>
                    <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">As output:</span> {@html obj.postprocessing }</p>
                    {#if obj.examples_format }
                    <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">Format expected for examples:</span> {@html obj.examples_format }}</p>
                    {/if}
                    {#if obj.events.length > 0}
                    <p class="text-lg text-gray-500"><span class="text-orange-500">Supported events:</span> <em>{@html obj.events }</em></p>
                    {/if}
            {/if}

            {#if obj.example }
                <h4 class="mt-4 p-3 font-semibold">Example Usage</h4>
                <div class="codeblock bg-gray-50 mx-auto p-3">
                    <pre><code class="code language-python">{  obj.example }</code></pre>
                </div>
            {/if}

        {#if (obj.parameters.length > 0 && obj.parameters[0].name != "self") || obj.parameters.length > 1 }
        <table class="table-fixed w-full mt-6 leading-loose">
          <thead class="text-left">
            <tr>
              <th class="p-3 font-semibold w-2/5">Parameter</th>
              <th class="p-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y">
            {#each obj.parameters as param}
              {#if param["name"] != "self" }
                <tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
                  <td class="p-3 w-2/5 break-words">
                    <code class="block">
                      { param["name"] }
                    </code>
                    <p class="text-gray-500 italic">{ param["annotation"] }</p>
                    {#if "default" in param }
                        <p class="text-gray-500 font-semibold">default: { param["default"] }</p>
                    {:else if !("kwargs" in param) }
                    <p class="text-orange-600 font-semibold italic">required</p>
                    {/if}
                  </td>
                  <td class="p-3 text-gray-700 break-words">
                    <p>{ param["doc"] || "" }</p>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
        {/if}
        
        </div>

    </div> 

</main>

