<script>
    import { page } from '$app/stores';
    import docs_json from "../docs.json";
    import { onMount } from 'svelte';
	import Demos from '../../../components/Demos.svelte';
    let docs = docs_json;
    let components = [];

    for (const key in docs) {
        if (docs[key].is_component) {
            components.push(docs[key])
        }
    }

    let doc_page;

    $: doc_page = docs[$page.params.doc];

</script>


<main class="container mx-auto px-4 flex gap-4">
    
    <div class="navigation mobile-nav overflow-y-auto hidden fixed backdrop-blur-lg z-50 bg-gray-200/50 pr-6 pl-4 py-4 -ml-4 h-full inset-0 w-5/6 lg:inset-auto lg:h-auto lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12 lg:min-w-2/12" id="mobile-nav">

        <a class="link px-4 my-2 block" href="/docs/building_demos/">Building Demos</a>
        <a class="thin-link px-4 block" href="/docs/interface/">Interface</a>
        <a class="thin-link px-4 block" href="/docs/flagging/">Flagging</a>
        <a class="thin-link px-4 block" href="/docs/combining-interfaces/">Combining Interfaces</a>
        <a class="thin-link px-4 block" href="/docs/blocks/">Blocks<sup class="text-orange-500">NEW</sup></a>
        <a class="thin-link px-4 block" href="/docs/block-layouts/">Block Layouts</a>
        <a class="link px-4 my-2 block" href="/docs/components/">Components</a>
        {#each components as component}
            <a class="px-4 block thin-link" href="/docs/{ component.obj.name.toLowerCase() }/">{ component.obj.name }</a>
        {/each}       
    </div>
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
            {#if doc_page.prev_obj}
              <a href="/docs/{ doc_page.prev_obj.name.toLowerCase() }"
                 class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline">
                <div class="text-lg"><span class="text-orange-500">&#8592;</span> { doc_page.prev_obj.name }</div>
              </a>
            {:else }
              <div></div>
            {/if}
            {#if doc_page.next_obj}
              <a href="/docs/{ doc_page.next_obj.name.toLowerCase() }"
                 class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
                <div class="text-lg">{ doc_page.next_obj.name } <span class="text-orange-500">&#8594;</span></div>
              </a>
            {:else }
              <div></div>
            {/if}
        </div>
        <div class="obj">
            <h3 id="{ doc_page.obj.name }-header" class="text-3xl font-light py-4">{ doc_page.obj.name }</h3>
            <div class="codeblock  bg-gray-50 mx-auto p-3"><pre><code class="code language-python">gradio.<span>{ doc_page.obj.name }</span></code></pre></div>
            <p class="mt-8 mb-2 text-lg">{ doc_page.obj.description }</p>
            
            {#if doc_page.is_component }
                <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">As input: </span> {@html doc_page.obj.tags.preprocessing }</p>
                <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">As output:</span> {@html doc_page.obj.tags.postprocessing }</p>
                {#if doc_page.obj.tags?.examples_format }
                <p class="mb-2 text-lg text-gray-500"> <span class="text-orange-500">Format expected for examples:</span> {@html doc_page.obj.tags.examples_format }}</p>
                {/if}
                {#if doc_page.obj.events.length > 0}
                <p class="text-lg text-gray-500"><span class="text-orange-500">Supported events:</span> <em>{@html doc_page.obj.events }</em></p>
                {/if}
            {/if}

        {#if doc_page.obj.example }
            <h4 class="mt-4 p-3 font-semibold">Example Usage</h4>
            <div class="codeblock bg-gray-50 mx-auto p-3">
                <pre><code class="code language-python">{  doc_page.obj.example }</code></pre>
            </div>
        {/if}

        {#if (doc_page.obj.parameters.length > 0 && doc_page.obj.parameters[0].name != "self") || doc_page.obj.parameters.length > 1 }
        <table class="table-fixed w-full mt-6 leading-loose">
          <thead class="text-left">
            <tr>
              <th class="p-3 font-semibold w-2/5">Parameter</th>
              <th class="p-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y">
            {#each doc_page.obj.parameters as param}
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

