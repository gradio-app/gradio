<script>
    export let fn;
    export let parent;
    import anchor from "../assets/img/anchor.svg";
</script>


<!-- name, signature, description, params -->

<div class="obj" id={ parent + fn.name.toLowerCase() }>
    <div class="flex flex-row items-center justify-between"> 
        <h3 id="{ fn.slug }-header" class="group text-3xl font-light py-4">{ fn.name }
        <a href="#{ fn.slug }-header" class="invisible group-hover-visible"><img class="anchor-img" src="{anchor}"/></a>
        </h3>
        
    </div>

    {#if fn.override_signature }
        <div class="codeblock  bg-gray-50 mx-auto p-3"><pre><code class="code language-python">{ fn.override_signature }</code></pre></div> 
    {:else }
        <div class="codeblock  bg-gray-50 mx-auto p-3"><pre><code class="code language-python">{fn.parent}.<span>{ fn.name }&lpar;</span><!--
        -->{#each fn.parameters as param }<!--
        -->{#if !("kwargs" in param) && !("default" in param) && (param.name != "self") }<!--
            -->{ param.name }, <!--
        -->{/if}<!--
        -->{/each}<!--  
        -->···<span>&rpar;</span></code></pre></div> 
    {/if}

    <p class="mt-8 mb-2 text-lg">{@html fn.description }</p>

    {#if fn.example }
                <h4 class="mt-4 p-3 font-semibold">Example Usage</h4>
                <div class="codeblock bg-gray-50 mx-auto p-3">
                    <pre><code class="code language-python">{  fn.example }</code></pre>
                </div>
    {/if}

    {#if (fn.parameters.length > 0 && fn.parameters[0].name != "self") || fn.parameters.length > 1 }
        <table class="table-fixed w-full mt-6 leading-loose">
          <thead class="text-left">
            <tr>
              <th class="p-3 font-semibold w-2/5">Parameter</th>
              <th class="p-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y">
            {#each fn.parameters as param}
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