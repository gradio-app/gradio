<script lang="ts">
    export let pages: [string, string][] = [];
</script>

<nav>
{#each pages as page, i}
    <a href={page[1] == "" ? "/" : `/page-${page[1]}`}>{page[0]}</a>
    {#if i < pages.length - 1}
        <span>&bull;</span>
    {/if}
{/each}
</nav>
<slot></slot>

<style>
    nav {
        display: flex;
        gap: 1em;
    }
    a:hover {
        text-decoration: underline;
    }
</style>