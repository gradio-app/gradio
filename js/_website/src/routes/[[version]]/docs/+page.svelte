<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";

	export let data: {
		[key: string]: any;
	};
</script>

<MetaTags
	title="Gradio API Documentation"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="API reference documentation for the Gradio ecosystem."
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<div class="float-right">
		<DropDown />
	</div>
	<h1
<<<<<<< HEAD
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
		Documentation
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
=======
		class="mb-4 flex items-center text-3xl font-semibold text-gray-900 dark:text-gray-100"
	>
		API Reference
	</h1>

	<div class="max-w-3xl mb-10 mt-6">
		<p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
			Explore the Gradio ecosystem — from building interactive demos with the
			core library, to integrating with client SDKs, to creating your own custom
			components.
		</p>
	</div>
>>>>>>> main

	<!-- Core Library -->
	<div class="mb-6">
		<h2
			class="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-4"
		>
			Core Library
		</h2>
	</div>
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-12">
		<div
			class="card-hover group flex flex-col overflow-hidden lg:col-span-2 rounded-xl px-6 pb-6 pt-8 bg-orange-50 dark:bg-neutral-800 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg transition-all"
		>
			<div class="relative">
				<a
					class="block text-gray-900 dark:text-gray-100"
					href="./docs/gradio"
					target="_self"
				>
					<div class="mb-3">
						<p class="text-2xl font-bold">Gradio</p>
						<code class="text-sm font-mono text-orange-700 dark:text-orange-300"
							>pip install gradio</code
						>
					</div>

					<div
						class="relative text-lg font-light mt-4 mb-10 pr-4 pb-48 lg:pb-4 lg:pr-[28rem]"
					>
						The fastest way to build and share machine learning demos and web
						applications. Create beautiful UIs for your models in just a few
						lines of Python.
					</div>
				</a>

				<!-- Fun pill cluster in bottom right -->
				<div
					class="pill-cluster-container absolute bottom-4 right-4 pointer-events-auto"
				>
					<div class="flex flex-col gap-2 items-end">
						<!-- Row 1 -->
						<div class="flex gap-2">
							<a
								href="./docs/gradio/interface"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(-2deg);"
								>Interface
							</a>
							<a
								href="./docs/gradio/blocks"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(3deg);"
								>Blocks
							</a>
						</div>
						<!-- Row 2 -->
						<div class="flex gap-2">
							<a
								href="./docs/gradio/chatinterface"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(-1deg);"
								>ChatInterface
							</a>
							<a
								href="./docs/gradio/textbox"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(2deg);"
								>Textbox
							</a>
						</div>
						<!-- Row 3 -->
						<div class="flex gap-2">
							<a
								href="./docs/gradio/image"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(-3deg);"
								>Image
							</a>
							<a
								href="./docs/gradio/audio"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(1deg);"
								>Audio
							</a>
							<a
								href="./docs/gradio/dataframe"
								target="_self"
								class="pill-cluster"
								style="transform: rotate(-2deg);"
								>Dataframe
							</a>
						</div>
					</div>
				</div>
<<<<<<< HEAD
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
=======
>>>>>>> main
			</div>
		</div>
	</div>

	<!-- Client Libraries -->
	<div class="mb-6">
		<h2
			class="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-4"
		>
			Client Libraries
		</h2>
	</div>
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-12">
		<a
			href="./docs/python-client"
			target="_self"
<<<<<<< HEAD
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[1]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
=======
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-green-50 dark:bg-neutral-800 border-2 border-green-200 dark:border-green-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
>>>>>>> main
		>
			<div class="mb-3">
				<div class="text-xl font-bold">Python Client</div>
			</div>
			<code class="text-sm font-mono text-gray-600 dark:text-gray-400 mb-3"
				>pip install gradio-client</code
			>
			<div class="text-base font-light">
				Make programmatic requests to Gradio apps from Python. Perfect for
				building pipelines and automation.
			</div>
		</a>

		<a
			href="./docs/js-client"
			target="_self"
<<<<<<< HEAD
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[0]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
=======
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-blue-50 dark:bg-neutral-800 border-2 border-blue-200 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
>>>>>>> main
		>
			<div class="mb-3">
				<div class="text-xl font-bold">JavaScript Client</div>
			</div>
			<code class="text-sm font-mono text-gray-600 dark:text-gray-400 mb-3"
				>npm install @gradio/client</code
			>
			<div class="text-base font-light">
				Connect to Gradio apps from JavaScript or TypeScript. Works in the
				browser and Node.js.
			</div>
		</a>

		<a
			href="./docs/third-party-clients"
			target="_self"
<<<<<<< HEAD
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[3]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
=======
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-purple-50 dark:bg-neutral-800 border-2 border-purple-200 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
>>>>>>> main
		>
			<div class="mb-3">
				<div class="text-xl font-bold">Third Party Clients</div>
			</div>
			<div class="text-base font-light mt-2">
				Community-built clients for Rust, Go, Ruby, and more. Extend Gradio to
				your favorite language.
			</div>
		</a>
	</div>

	<!-- Component Libraries -->
	<div class="mb-6">
		<h2
			class="text-sm uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-4"
		>
			Component Libraries
		</h2>
	</div>
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
		<a
			href="./docs/js"
			target="_self"
<<<<<<< HEAD
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[4]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
=======
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-pink-50 dark:bg-neutral-800 border-2 border-pink-200 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
>>>>>>> main
		>
			<div class="mb-3">
				<div class="text-xl font-bold">JavaScript Components</div>
			</div>
			<div class="text-base font-light">
				Use Gradio's UI components in standalone JavaScript applications. Build
				beautiful interfaces outside of Python.
			</div>
		</a>

		<a
			href="../guides/custom-components-in-five-minutes"
			target="_self"
<<<<<<< HEAD
			class="w-full shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-2 rounded-xl px-3 py-4 bg-gradient-to-r from-{data
				.COLOR_SETS[2]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
=======
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-yellow-50 dark:bg-neutral-800 border-2 border-yellow-200 dark:border-yellow-900 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
>>>>>>> main
		>
			<div class="mb-3">
				<div class="text-xl font-bold">Custom Components</div>
			</div>
			<div class="text-base font-light">
				Create, share, and discover custom components. Extend Gradio with your
				own unique UI elements.
			</div>
		</a>
	</div>
<<<<<<< HEAD

	<h1
		class="mb-4 flex items-center text-2xl font-light mt-8 text-gray-900 dark:text-gray-100"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			role="img"
			class="mr-1.5 text-gray-400 dark:text-gray-500 text-3xl"
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
			<h2
				class="mb-4 text-xl font-normal block text-gray-900 dark:text-gray-100"
			>
				{category}
			</h2>
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{#each guides as guide (guide.name)}
					<a
						class="shadow-alternate hover:scale-[1.04] guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl px-3 py-4 bg-gradient-to-r from-{data
							.COLOR_SETS[
							i
						]}-50 to-white dark:from-neutral-800 dark:to-neutral-800 hover:shadow-alternate shadow-none transition-shadow dark:hover:bg-neutral-900 text-gray-900 dark:text-gray-100"
						href=".{guide.url}"
					>
						<div class="flex flex-col p-4 h-min">
							<h2 class="text-lg">
								{guide.pretty_name}
							</h2>
							<div class="tags-holder">
								{#if guide.tags}
									<p class="text-gray-600 dark:text-gray-400">
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
=======
>>>>>>> main
</div>

<style>
	.quick-link {
		transition: all 0.2s ease-in-out;
	}

	.quick-link:hover {
		transform: translateY(-2px);
	}

	.card-hover {
		transition: all 0.3s ease-in-out;
	}

	.card-hover:hover {
		transform: translateY(-4px);
	}

	.pill-cluster-container {
		opacity: 0.5;
		transition: opacity 0.3s ease-in-out;
	}

	.pill-cluster-container:hover {
		opacity: 0.7;
	}

	.pill-cluster {
		padding: 0.375rem 0.875rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 600;
		background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
		color: #7c2d12;
		box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
		transition: all 0.3s ease-in-out;
		text-decoration: none;
		white-space: nowrap;
	}

	.pill-cluster:hover {
		transform: scale(1.1) rotate(0deg) !important;
		box-shadow: 0 4px 12px rgba(251, 146, 60, 0.5);
		z-index: 10;
	}

	:global(.dark) .pill-cluster {
		background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%);
		color: #fff;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);
	}

	:global(.dark) .pill-cluster:hover {
		box-shadow: 0 4px 12px rgba(234, 88, 12, 0.6);
	}
</style>
