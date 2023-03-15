<script>
    import { page } from '$app/stores';
    import guides_json from "../guides.json";
    import space_logo from "../../../assets/img/spaces-logo.svg";
    import MetaTags from "../../../components/MetaTags.svelte";

    export let data;

    let guides = data.guides;
    let guides_by_category = guides_json.guides_by_category;
    let guide;
    let nav = data.guide_slugs;

    const COLORS = ["bg-green-50", "bg-yellow-50", "bg-red-50", "bg-pink-50", "bg-purple-50"];

    let show_all = false;

    let sidebar;
    let target_link;
    let navigation;
    let y;

    $: if (sidebar) {
        if (target_link?.previousElementSibling.classList.contains("category-link")) {
            target_link = target_link.previousElementSibling;
        }
        sidebar.scrollTop = target_link?.offsetTop;
    }

    $: guide_page = guides.filter(guide => guide.name === $page.params.guide)[0];
</script> 

    <MetaTags title={guide_page.pretty_name}
              url={"https://gradio.app/guides/" + guide_page.name}
              canonical={"https://gradio.app/guides/" + guide_page.name}
              description="A Step-by-Step Gradio Tutorial"/>

<div class="container mx-auto px-4 flex gap-4 relative">
    <div
    bind:this={sidebar} 
    class="side-navigation h-screen leading-relaxed sticky top-0 text-md overflow-y-auto overflow-x-hidden hidden lg:block rounded-t-xl bg-gradient-to-r from-white to-gray-50"
        style="min-width: 18%">
        {#each guides_by_category as guides, i}
            <div class="category-link my-2 font-semibold px-4 pt-2 text-ellipsis block"
                style="max-width: 12rem">
            { guides.category }
            {#if !show_all && i === guides_by_category.length - 1 && guides.category !== guide_page.category}
                <button
                class:hidden={show_all}
                class="block show-guides" 
                on:click={() => show_all = true}> [ show ] </button>
            {/if}
            </div>
            {#each guides.guides as guide, j}
                {#if guide.name == guide_page.name }
                <a
                bind:this={target_link}
                class:hidden={!show_all && i === guides_by_category.length - 1 && guides.category !== guide_page.category}
                class:current-nav-link={guide.name == guide_page.name}
                class="guide-link -indent-2 ml-2 thin-link px-4 block overflow-hidden"
                    style="max-width: 12rem"
                    href="{ guide.url }">{guide.pretty_name}</a>

                    <div class="navigation max-w-full bg-gradient-to-r from-orange-50 to-orange-100 p-2 mx-2 border-l-2 border-orange-500 mb-2">
                        {#each nav[guide_page.name] as heading} 
                            <a class="subheading block thin-link -indent-2 ml-4 mr-2" href="{heading.href}">{heading.text}</a>
                        {/each}
                    </div>
                {:else}
                <a
                class:hidden={!show_all && i === guides_by_category.length - 1 && guides.category !== guide_page.category}
                class:current-nav-link={guide.name == guide_page.name}
                class="guide-link -indent-2 ml-2 thin-link px-4 block overflow-hidden"
                    style="max-width: 12rem"
                    href="{ guide.url }">{guide.pretty_name}</a>
                {/if}
            {/each}
        {/each}
    </div>
    <div class="w-full">
        {#if guide_page.spaces.length }
            <div id='spaces-holder' class="mb-4">
            <a href='https://hf.co/spaces' target='_blank'>
                <img class="inline-block my-0 mx-auto w-5 max-w-full pb-1"
                    src={space_logo}>
            </a>
            <p class="m-0 inline text-lg font-normal">Related Spaces:</p>
            {#each guide_page.spaces as space, i}
                <div class='space-link inline-block m-1 px-1 rounded-md {COLORS[i] ?? COLORS[i-COLORS.length]}'>
                <a href='{ space }' target='_blank' class="no-underline">{ space.slice(30) }</a>
                </div>
            {/each}
            </div>
        {/if}
        <div class="prose text-lg max-w-full">
            {@html guide_page.new_html}
        </div>
    </div>
</div>

<svelte:window bind:scrollY={y} />