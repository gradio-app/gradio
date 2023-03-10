<script>
    import MetaTags from "../../components/MetaTags.svelte";

    export let data;

    let content = data.content;
    let versions = data.versions;

    // $: if (sidebar) {
    //     if (target_link?.previousElementSibling.classList.contains("category-link")) {
    //         target_link = target_link.previousElementSibling;
    //     }
    //     sidebar.scrollTop = target_link?.offsetTop;
    // }
</script> 

<svelte:head>
    <MetaTags title={"Gradio Changelog"}
              url={"https://gradio.app/changelog"}
              canonical={"https://gradio.app/changelog"}
              description="Gradio Changelog and Release Notes"/>
</svelte:head>

<div class="container mx-auto px-4 flex gap-4 relative">
    <div class="side-navigation h-screen leading-relaxed sticky top-0 text-md overflow-y-auto overflow-x-hidden hidden lg:block rounded-t-xl bg-gradient-to-r from-white to-gray-50"
         style="min-width: 18%">
        <div class="category-link my-2 font-semibold px-4 pt-2 text-ellipsis block"
           style="max-width: 12rem">
           Version History
        </div>
        {#each versions as version} 
          <a class="guide-link pb-1 -indent-2 ml-2 thin-link px-4 block overflow-hidden"
              style="max-width: 12rem"
              href="#{ version[1]} ">{ version[0] }</a>
        {/each}
    </div>
    <div class="w-full">
      <div class="prose text-lg max-w-full">{@html content}</div>
    </div>
  </div>
