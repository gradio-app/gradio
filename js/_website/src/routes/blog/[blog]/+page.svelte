<script lang="ts">
	// @ts-nocheck
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { tick } from "svelte";
	import FancyDetails from "$lib/components/Details.svelte";
	import { onNavigate } from "$app/navigation";
	import { clickOutside } from "$lib/components/clickOutside.js";
	import CopyMarkdown from "$lib/components/CopyMarkdown.svelte";

	export let data: {
		blog: any;
		blog_slug: {
			text: string;
			href: string;
			level: number;
		}[];
		blog_names: {
			category: string;
			blogs: {
				name: string;
				pretty_name: string;
				url: string;
			}[];
		}[];
	};
	let blog_page = data.blog;
	let blog_names = data.blog_names;
	let blog_slug = data.blog_slug;

	let header_targets: { [key: string]: HTMLElement } = {};
	let current_header_id: string = "";

	$: if (y !== undefined && blog_slug.length > 0) {
		for (const slug of blog_slug) {
			const id = slug.href.slice(1);
			const el = document.getElementById(id);
			if (el && y >= el.offsetTop - 100) {
				current_header_id = id;
			}
		}
	}

	let show_nav = false;
	let sidebar: HTMLElement;
	let target_link: HTMLElement;
	let y: number;
	let content_el: HTMLDivElement;

	let flattened_blogs = blog_names.map((category) => category.blogs).flat();
	let prev_blog: any;
	let next_blog: any;

	$: if (sidebar) {
		if (
			target_link?.previousElementSibling?.classList.contains("category-link")
		) {
			target_link = target_link.previousElementSibling as HTMLElement;
		}
		sidebar.scrollTop = target_link?.offsetTop;
	}
	$: blog_page = data.blog;
	$: blog_slug = data.blog_slug;
	$: flattened_blogs = blog_names.map((category) => category.blogs).flat();
	$: prev_blog =
		flattened_blogs[
			flattened_blogs.findIndex((blog) => blog.url === blog_page.url) - 1
		];
	$: next_blog =
		flattened_blogs[
			flattened_blogs.findIndex((blog) => blog.url === blog_page.url) + 1
		];
	$: blog_names = data.blog_names;

	let _details: (FancyDetails | void)[] = [];

	async function make_details() {
		_details.forEach((c) => c?.$destroy());
		await tick();
		const details = document.querySelectorAll("details");
		if (details.length === 0) return;

		_details = Array.from(details).map((detail) => {
			const summary_text = detail.querySelector("summary")?.innerHTML;
			const detail_children = detail.querySelectorAll(
				"details > *:not(summary)"
			);

			let detail_text = "";
			detail_children.forEach((child, i) => {
				detail_text += `<p>${child.innerHTML}</p>`;
			});

			if (!summary_text || !detail_text) return;

			const new_el = document.createElement("div");
			const comp = new FancyDetails({
				target: new_el,
				props: {
					summary: summary_text,
					content: detail_text
				}
			});
			detail.replaceWith(new_el);

			return comp;
		});
	}

	$: content_el && data.blog.new_html && make_details();

	onNavigate(() => {
		show_nav = false;
	});

	$: show_nav;

	function get_category(name: string) {
		if (blog_names) {
			for (let category of blog_names) {
				for (let blog of category.blogs) {
					if (blog.name === name) {
						return [category.category, blog.pretty_name];
					}
				}
			}
		}
	}

	let category_and_name: any[] | undefined = get_category(blog_page.name);

	$: category_and_name = get_category(blog_page.name);
</script>

<MetaTags
	title={blog_page.pretty_name}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="A blog post from the Gradio team"
/>
<div class="container mx-auto px-4 pt-8 flex relative w-full">
	<!-- Mobile menu -->

	<div
		class:hidden={!show_nav}
		class="fixed inset-0 bg-black/20 backdrop-blur-md lg:hidden z-50"
	>
		<div
			use:clickOutside
			on:click_outside={() => (show_nav = false)}
			class:hidden={!show_nav}
			class="max-w-max min-w-[75%] shadow overflow-y-auto fixed backdrop-blur-lg z-50 bg-white dark:bg-neutral-900 px-6 py-4 h-full inset-0"
			id="mobile-nav"
		>
			<button
				on:click={() => (show_nav = false)}
				type="button"
				class="absolute z-10 top-4 right-4 w-2/12 h-4 flex items-center justify-center text-grey-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 p-4"
				tabindex="0"
			>
				<svg viewBox="0 0 10 10" class="overflow-visible" style="width: 10px"
					><path
						d="M0 0L10 10M10 0L0 10"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path></svg
				>
			</button>

			<div class="space-y-6 mt-12">
				{#each blog_names as { category, blogs } (category)}
					<div>
						<h2
							class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
						>
							{category}
						</h2>
						<ul class="space-y-2">
							{#each blogs as blog (blog.name)}
								<li>
									<a
										href="..{blog.url}"
										class="block text-sm transition-colors py-1 {blog.name ===
										blog_page.name
											? 'text-orange-600 dark:text-orange-400 font-semibold'
											: 'text-gray-600 dark:text-gray-400'}"
									>
										{blog.pretty_name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<nav
		bind:this={sidebar}
		class="w-64 flex-shrink-0 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto hidden lg:block pr-8"
	>
		<div class="space-y-8">
			{#each blog_names as { category, blogs } (category)}
				<div>
					<h2
						class="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-3"
					>
						{category}
					</h2>
					<ul class="space-y-2">
						{#each blogs as blog (blog.name)}
							<li>
								{#if blog.name === blog_page.name}
									<a
										bind:this={target_link}
										href="..{blog.url}"
										class="block text-sm transition-colors py-1 text-orange-600 dark:text-orange-400 font-semibold"
									>
										{blog.pretty_name}
									</a>
								{:else}
									<a
										href="..{blog.url}"
										class="block text-sm transition-colors py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
									>
										{blog.pretty_name}
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</nav>
	<div class="w-full lg:w-8/12 lg:min-w-0 lg:pl-8">
		<div
			class="flex items-center p-4 border-b border-t border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]"
		>
			<button
				on:click={() => (show_nav = !show_nav)}
				type="button"
				class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
			>
				<svg width="24" height="24"
					><path
						d="M5 6h14M5 12h14M5 18h14"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path></svg
				>
			</button>
			{#if category_and_name}
				<ol class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
					<li class="flex items-center">
						{category_and_name[0]}
						<svg
							width="3"
							height="6"
							aria-hidden="true"
							class="mx-3 overflow-visible text-slate-400"
							><path
								d="M0 0L3 3L0 6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							></path></svg
						>
					</li>
					<li class="font-semibold text-slate-900 truncate dark:text-slate-200">
						{category_and_name[1]}
					</li>
				</ol>
			{/if}
		</div>

		{#if blog_page.author || blog_page.date}
			<div
				class="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
			>
				{#if blog_page.author}
					<span class="flex items-center gap-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
						{blog_page.author}
					</span>
				{/if}
				{#if blog_page.date}
					<span class="flex items-center gap-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						{blog_page.date}
					</span>
				{/if}
			</div>
		{/if}

		{#if blog_page.tags && blog_page.tags.length > 0}
			<div class="flex flex-wrap gap-2 mb-6">
				{#each blog_page.tags as tag}
					<span
						class="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<div
			class="prose text-lg max-w-full dark:prose-invert"
			bind:this={content_el}
		>
			<CopyMarkdown markdown_content={blog_page.content} />
			{@html blog_page.new_html}
		</div>
		<div class="w-full flex flex-wrap justify-between mt-12 mb-8">
			{#if prev_blog}
				<a
					href="..{prev_blog.url}"
					class="text-left px-4 py-1 bg-gray-50 dark:bg-neutral-800 rounded-full text-gray-900 dark:text-gray-100 hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<span class="text-orange-500 mr-1">&#8592;</span>
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{prev_blog.pretty_name}
						</p>
					</div>
				</a>
			{:else}
				<div />
			{/if}
			{#if next_blog}
				<a
					href="..{next_blog.url}"
					class="text-right px-4 py-1 bg-gray-50 dark:bg-neutral-800 rounded-full text-gray-900 dark:text-gray-100 max-w-1/2 hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{next_blog.pretty_name}
						</p>
						<span class="text-orange-500 ml-1">&#8594;</span>
					</div>
				</a>
			{:else}
				<div />
			{/if}
		</div>
	</div>

	{#if blog_slug.length > 0}
		<div
			class="float-right top-8 hidden sticky h-screen overflow-y-auto lg:block lg:w-2/12"
		>
			<div class="mx-8">
				<a
					class="text-sm tracking-wider font-semibold text-gray-600 dark:text-gray-300 py-2 block"
					href="#"
				>
					{blog_page.pretty_name}
				</a>
				<ul class="space-y-2 list-none">
					{#each blog_slug as slug}
						<li style="padding-left: {(slug.level - 2) * 0.75}rem">
							<a
								bind:this={header_targets[slug.href.slice(1)]}
								href={slug.href}
								class="block text-sm transition-colors py-1 {current_header_id ===
								slug.href.slice(1)
									? 'text-orange-500 font-medium'
									: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}"
							>
								{slug.text}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>

<svelte:window bind:scrollY={y} />
