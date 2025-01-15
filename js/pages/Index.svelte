<script lang="ts">
	import { onMount } from "svelte";

    export let pages: [string, string][] = [];
    let links: HTMLAnchorElement[] = [];

    const handle_link_click = (e: MouseEvent) => {
        e.preventDefault();
        const target = e.target as HTMLAnchorElement;
        navigate(target.href, true);
    }

    const navigate = (path: string, push_to_history = false) => {
        let target = links.find((link) => link.href === path);
        if (!target) {
            target = links[0];
            path = target.href;
        }
        const pathname = new URL(path);
        if (push_to_history) {
            window.history.pushState({}, '', pathname);
        }
        links.forEach((link) => {
            link.classList.remove('active');
        });
        target.classList.add('active');
        document.querySelectorAll('div[data-route]').forEach((el) => {
            (el as HTMLDivElement).style.display = 'none';
        });
        (document.querySelector(`div[data-route="${pathname.pathname}"]`) as HTMLDivElement).style.display = 'block';
    }

    onMount(() => {
        navigate(window.location.href);
        window.addEventListener('popstate', () => {
            navigate(window.location.href);
        });
    });
</script>

<nav>
{#each pages as page, i}
    <a href="/page{page[1]}" bind:this={links[i]} on:click={handle_link_click}>{page[0]}</a>
    {#if i < pages.length - 1}
        <span>&bull;</span>
    {/if}
{/each}
</nav>
<div class="content">
    <slot></slot>
</div>

<style>
    nav {
        display: flex;
        gap: 1em;
    }
    a:hover {
        text-decoration: underline;
    }
</style>