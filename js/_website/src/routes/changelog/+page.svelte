<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data: {
		content: any;
		changelog_slug: {
			text: string;
			href: string;
		}[];
	};

	let content = data.content;
	let slugs = data.changelog_slug;

	function handleAnchorClick(event: MouseEvent) {
		event.preventDefault();
		const link = event.currentTarget as HTMLAnchorElement;
		const anchorId = new URL(link.href).hash.replace("#", "");
		const anchor = document.getElementById(anchorId);
		window.scrollTo({
			top: anchor?.offsetTop,
			behavior: "smooth"
		});
	}
</script>

<MetaTags
	title={"Gradio Changelog"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Gradio Changelog and Release Notes"
/>

<div class="container mx-auto px-4 flex gap-4 relative">
	<div
		class="side-navigation h-screen leading-relaxed sticky top-0 text-md overflow-y-auto overflow-x-hidden hidden lg:block rounded-t-xl bg-gradient-to-r from-white to-gray-50"
		style="min-width: 18%"
	>
		<div
			class="category-link my-2 font-semibold px-4 pt-2 text-ellipsis block"
			style="max-width: 12rem"
		>
			Version History
		</div>
		<div class="navigation max-w-full p-2 mx-2 mb-2">
			{#each slugs as heading}
				{#if heading.text == "4.0.0"}
					<div class="flex">
						<a
							class="subheading block thin-link mr-1 px-2 rounded-lg w-min border border-orange-500"
							href={heading.href}
							on:click={handleAnchorClick}>{heading.text}</a
						>
						<p class="inline">🔥</p>
					</div>
				{:else}
					<a
						class="subheading block thin-link mr-2 px-2 rounded-lg"
						href={heading.href}
						on:click={handleAnchorClick}>{heading.text}</a
					>
				{/if}
			{/each}
		</div>
	</div>
	<div class="w-10/12 mx-auto">
		<div class="prose text-lg max-w-full">{@html content}</div>
	</div>
</div>
