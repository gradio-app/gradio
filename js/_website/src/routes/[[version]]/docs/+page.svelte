<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio API Reference"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="API reference documentation for the Gradio ecosystem."
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<div class="float-right">
		<DropDown />
	</div>
	<h1
		class="mb-4 flex items-center text-2xl font-light text-gray-900 dark:text-gray-100"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1.5 text-gray-400 dark:text-gray-500 text-3xl"
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
		API Reference
	</h1>

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mt-8">
		<div
			class="shadow-alternate hover:scale-[1.02] group group flex flex-col overflow-hidden md:first:row-span-3 rounded-xl px-3 pb-4 pt-6 bg-orange-50 dark:bg-orange-900 hover:shadow-alternate shadow-none transition-shadow"
		>
			<a
				class="mt-auto mb-2 flex-grow text-gray-900 dark:text-gray-100"
				href="./docs/gradio"
				target="_self"
			>
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
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Interface
				</a>
				<a
					href="./docs/gradio/blocks"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Blocks
				</a>
				<a
					href="./docs/gradio/chatinterface"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>ChatInterface
				</a>
				<a
					href="./docs/gradio/textbox"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Textbox
				</a>
				<a
					href="./docs/gradio/image"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Image
				</a>
				<a
					href="./docs/gradio/audio"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Audio
				</a>
				<a
					href="./docs/gradio/dataframe"
					target="_self"
					class="shadow-alternate quick-link rounded-xl px-3.5 py-1 m-2 text-md font-semibold text-white dark:text-gray-900 bg-orange-300 hover:drop-shadow-md"
					>Dataframe
				</a>
			</div>
		</div>
		<a
			href="./docs/python-client"
			target="_self"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[1]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
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
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[0]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
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
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[3]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
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
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[4]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
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
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[2]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
		>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Custom Components</span>
			</div>
			<div class="relative pr-4 text-lg font-light">
				Create, use, and share your own custom components within a Gradio
				application.
			</div>
		</a>
	</div>
</div>

<!-- -->

<style>
	.quick-link {
		transition: transform 0.1s ease-in-out;
	}
</style>
