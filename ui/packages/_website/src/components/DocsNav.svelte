<script>
    export let components;
    export let helpers;
    export let routes;
</script>

<div class="navigation mobile-nav overflow-y-auto hidden fixed backdrop-blur-lg z-50 bg-gray-200/50 pr-6 pl-4 py-4 -ml-4 h-full inset-0 w-5/6 lg:inset-auto lg:h-auto lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12 lg:min-w-2/12" id="mobile-nav">

    <a class="link px-4 my-2 block" href="/docs/building_demos/">Building Demos</a>
    <a class="thin-link px-4 block" href="/docs/interface/">Interface</a>
    <a class="thin-link px-4 block" href="/docs/flagging/">Flagging</a>
    <a class="thin-link px-4 block" href="/docs/combining-interfaces/">Combining Interfaces</a>
    <a class="thin-link px-4 block" href="/docs/blocks/">Blocks<sup class="text-orange-500">NEW</sup></a>
    <a class="thin-link px-4 block" href="/docs/block-layouts/">Block Layouts</a>
    <a class="link px-4 my-2 block" href="/docs/components/">Components</a>
    {#each Object.entries(components) as  [name, obj] ( name )}
        <a class="px-4 block thin-link" href="/docs/{ name }/">{ obj.name }</a>
    {/each}
    <a class="link px-4 my-2 block" href="/docs/components/">Helpers</a>
    {#each Object.entries(helpers) as  [name, obj] ( name )}
        <a class="px-4 block thin-link" href="/docs/{ name }/">{ obj.name }</a>
    {/each}
    <a class="link px-4 my-2 block" href="/docs/components/">Routes</a>
    {#each Object.entries(routes) as  [name, obj] ( name )}
        <a class="px-4 block thin-link" href="/docs/{ name }/">{ obj.name }</a>
    {/each}       
</div>