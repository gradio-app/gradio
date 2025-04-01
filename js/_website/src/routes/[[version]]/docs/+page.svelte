<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio Documentation"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Documentation, tutorials and guides for the Gradio ecosystem."
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<div class="float-right">
		<DropDown />
	</div>
	<h1 class="mb-4 flex items-center text-2xl font-light">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1.5 text-gray-400 text-3xl"
			width="1em"
			height="1em"
			preserveAspectRatio="xMidYMid meet"
			viewBox="0 0 32 32"
			><path
				opacity="0.5"
				d="M20.9022 5.10334L10.8012 10.8791L7.76318 9.11193C8.07741 8.56791 8.5256 8.11332 9.06512 7.7914L15.9336 3.73907C17.0868 3.08811 18.5002 3.26422 19.6534 3.91519L19.3859 3.73911C19.9253 4.06087 20.5879 4.56025 20.9022 5.10334Z"
				fill="currentColor"
			></path><path
				d="M10.7999 10.8792V28.5483C10.2136 28.5475 9.63494 28.4139 9.10745 28.1578C8.5429 27.8312 8.074 27.3621 7.74761 26.7975C7.42122 26.2327 7.24878 25.5923 7.24756 24.9402V10.9908C7.25062 10.3319 7.42358 9.68487 7.74973 9.1123L10.7999 10.8792Z"
				fill="currentColor"
				fill-opacity="0.75"
			></path><path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M21.3368 10.8499V6.918C21.3331 6.25959 21.16 5.61234 20.8346 5.03949L10.7971 10.8727L10.8046 10.874L21.3368 10.8499Z"
				fill="currentColor"
			></path><path
				opacity="0.5"
				d="M21.7937 10.8488L10.7825 10.8741V28.5486L21.7937 28.5234C23.3344 28.5234 24.5835 27.2743 24.5835 25.7335V13.6387C24.5835 12.0979 23.4365 11.1233 21.7937 10.8488Z"
				fill="currentColor"
			></path></svg
		>
		Documentation
	</h1>

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mt-8">
		<div
			class="shadow-alternate hover:scale-[1.02] group group flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-br px-3 pb-4 pt-6 from-orange-100 via-orange-50 hover:shadow-alternate to-white shadow-none transition-shadow"
		>
			<a class="mt-auto mb-2 flex-grow" href="./docs/gradio" target="_self">
				<div class="text-lg">
					<p class="font-semibold">Gradio</p>
				</div>

				<code class="font-light text-md mb-2">gradio</code>
				<div class="  relative pr-4 text-lg font-light mt-2">
					Build and share machine learning demos and web applications using the
					core Gradio Python library.
				</div>
			</a>
			<div class="hidden lg:flex flex-wrap mx-auto justify-center">
				<a
					href="./docs/gradio/interface"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Interface
				</a>
				<a
					href="./docs/gradio/blocks"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Blocks
				</a>
				<a
					href="./docs/gradio/chatinterface"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>ChatInterface
				</a>
				<a
					href="./docs/gradio/textbox"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Textbox
				</a>
				<a
					href="./docs/gradio/image"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Image
				</a>
				<a
					href="./docs/gradio/audio"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Audio
				</a>
				<a
					href="./docs/gradio/dataframe"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white bg-orange-300 hover:drop-shadow-md"
					>Dataframe
				</a>
			</div>
		</div>
		<a
			href="./docs/python-client"
			target="_self"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[1]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Python Client</span>
			</div>
			<code class="font-light text-md mb-2">gradio-client</code>
			<div class="relative pr-4 text-lg font-light">
				Make programmatic requests to Gradio applications from Python
				environments.
			</div>
		</a>

		<a
			href="./docs/js-client"
			target="_self"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[0]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Javascript Client</span>
			</div>
			<code class=" text-md mb-2">@gradio/client</code>
			<div class="relative pr-4 text-lg font-light">
				Make programmatic requests to Gradio applications in JavaScript
				(TypeScript) from the browser or server-side.
			</div>
		</a>

		<a
			href="./docs/third-party-clients"
			target="_self"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[3]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Third Party Clients</span>
			</div>
			<div class="relative pr-4 text-lg font-light">
				Make programmatic requests to Gradio applications using third party
				clients built by the gradio community.
			</div>
		</a>
	</div>

	<div class="grid grid-cols-1 gap-5 lg:flex lg:flex-row mt-8">
		<a
			href="./docs/js"
			target="_self"
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[4]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Javascript Components</span>
			</div>
			<div class="relative pr-4 text-lg font-light">
				Use Gradio's UI components in standalone JavaScript applications outside
				of the Gradio environment.
			</div>
		</a>

		<a
			href="../guides/custom-components-in-five-minutes"
			target="_self"
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[2]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Custom Components</span>
			</div>
			<div class="relative pr-4 text-lg font-light">
				Create, use, and share your own custom components within a Gradio
				application.
			</div>
		</a>
		<a
			href="../guides/gradio-lite"
			target="_self"
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl bg-gradient-to-r px-3 py-4 dark:border-gray-900 from-{data
				.COLOR_SETS[5]}-50 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 dark:to-gray-950 dark:hover:from-gray-800"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Gradio Lite</span>
			</div>
			<code class="font-light text-md mb-2">@gradio/lite</code>

			<div class="relative pr-4 text-lg font-light">
				Run Gradio's Python code serverless (entirely in your browser) using
				WebAssembly.
			</div>
		</a>
	</div>

	<h1 class="mb-4 flex items-center text-2xl font-light mt-8">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1.5 text-gray-400 text-3xl"
			width="0.75em"
			height="0.75em"
			preserveAspectRatio="xMidYMid meet"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path
				d="M15,19H9c-0.6,0-1-0.4-1-1v-0.5c0-1.4-0.6-2.8-1.7-3.9C4.7,12,3.9,9.9,4,7.7C4.2,3.5,7.7,0.1,11.9,0L12,0     c4.4,0,8,3.6,8,8c0,2.1-0.8,4.2-2.4,5.7c-1.1,1-1.6,2.4-1.6,3.8V18C16,18.6,15.6,19,15,19z M10,17h4c0.1-1.8,0.9-3.4,2.2-4.8     C17.4,11.1,18,9.6,18,8c0-3.3-2.7-6-6-6l-0.1,0C8.8,2.1,6.1,4.6,6,7.8C5.9,9.4,6.6,11,7.7,12.2C9.1,13.6,9.9,15.3,10,17z"
			/>

			<path
				d="M12,24L12,24c-2.2,0-4-1.8-4-4v-2c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1v2C16,22.2,14.2,24,12,24z M10,19v1c0,1.1,0.9,2,2,2     H12c1.1,0,2-0.9,2-2v-1H10z"
			/>

			<path
				d="M9,9C8.4,9,8,8.6,8,8c0-2.2,1.8-4,4-4c0.6,0,1,0.4,1,1s-0.4,1-1,1c-1.1,0-2,0.9-2,2C10,8.6,9.6,9,9,9z"
			/>
		</svg>
		Guides
	</h1>

	{#each data.guides_by_category as { category, guides }, i (category)}
		<div class="category py-4">
			<h2 class="mb-4 text-xl font-normal block">
				{category}
			</h2>
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{#each guides as guide (guide.name)}
					<a
						class="shadow-alternate hover:scale-[1.04] guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl bg-gradient-to-r px-3 py-4 from-{data
							.COLOR_SETS[
							i
						]}-50 hover:shadow-alternate to-white shadow-none transition-shadow"
						href=".{guide.url}"
					>
						<div class="flex flex-col p-4 h-min">
							<h2 class="text-lg">
								{guide.pretty_name}
							</h2>
							<div class="tags-holder">
								{#if guide.tags}
									<p class="text-gray-600">
										<!--
                    -->{#each guide.tags as tag, j (tag)}<!--
                    -->{tag}{#if j !== guide.tags.length - 1},&nbsp;{/if}<!--
                    -->{/each}<!--
                -->
									</p>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>

<!-- -->

<style>
	.quick-link {
		transition: transform 0.1s ease-in-out;
	}
</style>
