<script>
    import guides_json from "./guides.json";
    let guides_by_category = guides_json.guides_by_category;

    const COLOR_SETS = [
        ["from-green-100", "to-green-50"],
        ["from-yellow-100", "to-yellow-50"],
        ["from-red-100", "to-red-50"],
        ["from-blue-100", "to-blue-50"],
        ["from-pink-100", "to-pink-50"],
        ["from-purple-100", "to-purple-50"],
    ]
    
    let search_query = "";

    function search() {
        for (const category in guides_by_category) {
            for (const guide in guides_by_category[category].guides) {
                let g = guides_by_category[category].guides[guide];
                guides_by_category[category].guides[guide].hidden = !(g.pretty_name.toLowerCase().includes(search_query.toLowerCase()) || g.content.toLowerCase().includes(search_query.toLowerCase()))
            }
        }
    }
    
    let total_guides = 0;
    for (const category in guides_by_category) {
        for (const guide in guides_by_category[category].guides) {
                total_guides += 1;
        }
    }


</script>

<div class="container mx-auto px-4 relative pt-8 mb-12">

    <input id="search-by-tag"
             type="text"
             class="w-full border border-gray-200 p-1 rounded-full outline-none text-center text-lg mb-1 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0"
             placeholder="What do you want to build?"
             autocomplete="off"
             bind:value={search_query}
             on:keyup={search}
            />

    <div class="text-gray-600 mb-6 mx-auto w-fit text-sm">
        Search through
        <span id="counter">{ total_guides }</span>
        Guides. <a class="link text-gray-600"
    href="https://github.com/gradio-app/gradio/tree/main/guides">Contribute here</a>
      </div>
    {#each guides_by_category as {category, guides}, i (category)}
    <div class="category mb-8">
    <h2 
    class:hidden={guides.filter(guide => !guide.hidden).length === 0}
    class="mb-4 text-2xl font-thin block">{ category }</h2>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {#each guides as guide (guide.name)}
        <a 
        class:hidden={guide.hidden}
        class="guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {COLOR_SETS[i][0]} {COLOR_SETS[i][1]}"
            name="{ guide.name }"
            href="/{ guide.name }">
            <div class="flex flex-col p-4 h-min">
            <h2 class="group-hover:underline text-lg">{ guide.pretty_name }</h2>
            <div class="tags-holder">
                {#if guide.tags}
                <p class="text-gray-600"><!--
                    -->{#each guide.tags as tag, j (tag)}<!--
                    -->{ tag }{#if j !== guide.tags.length - 1},&nbsp;{/if}<!--
                    -->{/each}<!--
                --></p>
                {/if}
            </div>
            </div>
        </a>
        {/each}
    </div>
    </div>
    {/each}

    <div 
    class:hidden={guides_by_category.filter(category => category.guides.filter(guide => !guide.hidden).length !== 0).length !== 0}
    class="no-guides hidden text-center text-xl text-gray-500">
        <p class="mb-4">Sorry, we couldn't find a guide with this query...</p>
        <p>
          Try a different term, or <a class="link" href="/docs">see the docs</a>
        </p>
      </div>

</div>