<script>
    import { page } from '$app/stores';
	  import Demos from '../../../components/Demos.svelte';
    import DocsNav from '../../../components/DocsNav.svelte';
    import FunctionDoc from '../../../components/FunctionDoc.svelte';
    import MetaTags from "../../../components/MetaTags.svelte";
    import anchor from "../../../assets/img/anchor.svg";


    export let data;

    let name = data.name;
    let obj = data.obj;
    let mode = data.mode;
    let docs = data.docs;
    let components = data.components;
    let helpers = data.helpers;
    let routes = data.routes;

    let current_selection = 0;


    $: for (const key in docs) {
        for (const o in docs[key]) {
            if (o == $page.params.doc) {
                obj = docs[key][o];
                mode = key;
            }
        }
    }

</script>


  <MetaTags title={"Gradio " + obj.name + " Docs"} 
            url={"https://gradio.app/docs/" + obj.name.toLowerCase()} 
            canonical={"https://gradio.app/docs/" + obj.name.toLowerCase()}
            description={obj.description}/>

<main class="container mx-auto px-4 flex gap-4">

  <DocsNav current_nav_link={obj.name.toLowerCase()} components={components} helpers={helpers} routes={routes} />
    
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
                <div class="text-lg"><span class="text-orange-500">&#8592;</span> { obj.prev_obj.replace("-", " ") }</div>
              </a>
            {:else }
              <div></div>
            {/if}
            {#if obj.next_obj}
              <a href="/docs/{ obj.next_obj.toLowerCase() }"
                 class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
                <div class="text-lg">{ obj.next_obj.replace("-", " ") } <span class="text-orange-500">&#8594;</span></div>
              </a>
            {:else }
              <div></div>
            {/if}
        </div>
        
        <div class="obj" id={ obj.name.toLowerCase() }>
            
            <div class="flex flex-row items-center justify-between"> 
                <h3 id="{ obj.slug }-header" class="group text-3xl font-light py-4">{ obj.name }
                <a href="#{ obj.slug }-header" class="invisible group-hover-visible"><img class="anchor-img" src="{anchor}"/></a>
                </h3>
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
                    <gradio-app space={"gradio/" + obj.name.toLowerCase() + "_component"} />
                </div>
            {/if}
            
            <h4 class="mt-8 text-xl text-orange-500 font-light group" id="description">Description
              <a href="#description" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
            </h4>
            <p class="mb-2 text-lg text-gray-600">{@html obj.description }</p>

            {#if mode === "components" }
                    <h4 class="mt-4 text-xl text-orange-500 font-light group" id="behavior">Behavior
                      <a href="#behavior" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
                    </h4>
                    <p class="text-lg text-gray-500"> <span class="text-gray-700">As input: </span> {@html obj.preprocessing }</p>
                    <p class="text-lg text-gray-500"> <span class="text-gray-700">As output:</span> {@html obj.postprocessing }</p>
                    {#if obj.examples_format }
                    <p class="text-lg text-gray-500"> <span class="text-gray-700">Format expected for examples:</span> {@html obj.examples_format }}</p>
                    {/if}
                    {#if obj.events && obj.events.length > 0}
                    <p class="text-lg text-gray-500"><span class="text-gray-700">Supported events:</span> <em>{@html obj.events }</em></p>
                    {/if}
            {/if}

            {#if obj.example }
                <h4 class="mt-4 text-xl text-orange-500 font-light group" id="example-usage">Example Usage
                  <a href="#example-usage" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
                </h4>
                <div class="codeblock bg-gray-50 mx-auto p-3 mt-2">
                    <pre><code class="code language-python">{@html obj.highlighted_example }</code></pre>
                </div>
            {/if}

        {#if (obj.parameters.length > 0 && obj.parameters[0].name != "self") || obj.parameters.length > 1 }
        <h4 class="mt-6 text-xl text-orange-500 font-light group" id="initialization">Initialization
          <a href="#initialization" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
        </h4>
        <table class="table-fixed w-full leading-loose">
          <thead class="text-left">
            <tr>
              <th class="px-3 pb-3 w-2/5 text-gray-700 font-semibold">Parameter</th>
              <th class="px-3 pb-3 text-gray-700 font-semibold">Description</th>
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

        {#if mode === "components" && obj.string_shortcuts }
        <h4 class="mt-6 text-xl text-orange-500 font-light group" id="shortcuts">Shortcuts
          <a href="#shortcuts" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
        </h4>
        <table class="mb-4 table-fixed w-full">
          <thead class="text-left">
            <tr>
              <th class="px-3 pb-3 text-gray-700 font-semibold w-2/5">Class</th>
              <th class="px-3 pb-3 text-gray-700 font-semibold">Interface String Shortcut</th>
              <th class="px-3 pb-3 text-gray-700 font-semibold">Initialization</th>
            </tr>
          </thead>
          <tbody class="text-left divide-y rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
          {#each obj.string_shortcuts as shortcut }
              <tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
                <td class="p-3 w-2/5 break-words" >
                  <p><code class="lang-python">gradio.{ shortcut[0] }</code></p>
                </td>
                <td class="p-3 w-2/5 break-words">
                  <p>"{ shortcut[1] }"</p>
                </td>
                <td class="p-3 text-gray-700 break-words">
                  { shortcut[2] }
                </td>
              </tr>
          {/each}
          </tbody>
        </table>
         {/if}

         {#if obj.demos }

            <div class="category my-8" id="examples">
              <h4 class="text-xl text-orange-500 font-light group"  id="demos">Demos
                <a href="#demos" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
              </h4>
              <div>
                <div class="demo-window overflow-y-auto h-full w-full mb-4">
                  <div class="relative mx-auto my-auto rounded-md bg-white" style="top: 5%; height: 90%">
                    <div class="flex overflow-auto pt-4">
                      {#each obj.demos as demo, i }
                      <button
                        on:click={() => (current_selection = i)}
                        class:selected-demo-tab={current_selection == i}
                        class="demo-btn px-4 py-2 text-lg min-w-max text-gray-600 hover:text-orange-500"
                        name="{ demo[0] }">{ demo[0] }</button>
                      {/each}
                    </div>
                    {#each obj.demos as demo, i }
                    <div 
                    class:hidden={current_selection !== i }
                    class:selected-demo-window={current_selection == i}
                    class="demo-content px-4" name="{ demo[0] }">
                      <Demos name={demo[0]} code={demo[1]} highlighted_code={demo[2]} />
                    </div>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

          {/if}


         {#if obj.fns && obj.fns.length > 0 }
            <h4 class="mt-4 p-3 text-xl text-orange-500 font-light group"  id="methods">Methods
              <a href="#methods" class="invisible group-hover-visible"><img class="anchor-img-small" src="{anchor}"/></a>
            </h4>
              <div class="flex flex-col gap-8 pl-12">
                {#each obj.fns as fn}

                  <FunctionDoc fn={fn} parent={obj.name} />
               
                {/each}
              <div class="ml-12"> </div>
            </div>
          {/if}
        
        </div>

        <div class="flex justify-between my-4">
          {#if obj.prev_obj}
            <a href="/docs/{ obj.prev_obj.toLowerCase() }"
               class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline">
              <div class="text-lg"><span class="text-orange-500">&#8592;</span> { obj.prev_obj.replace("-", " ") }</div>
            </a>
          {:else }
            <div></div>
          {/if}
          {#if obj.next_obj}
            <a href="/docs/{ obj.next_obj.toLowerCase() }"
               class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
              <div class="text-lg">{ obj.next_obj.replace("-", " ") } <span class="text-orange-500">&#8594;</span></div>
            </a>
          {:else }
            <div></div>
          {/if}
      </div>

    </div> 

</main>

