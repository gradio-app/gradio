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
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-green-50 dark:bg-neutral-800 border-2 border-green-200 dark:border-green-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
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
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-blue-50 dark:bg-neutral-800 border-2 border-blue-200 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
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
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-purple-50 dark:bg-neutral-800 border-2 border-purple-200 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
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
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-pink-50 dark:bg-neutral-800 border-2 border-pink-200 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
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
			class="card-hover group relative flex flex-col overflow-hidden rounded-xl px-5 py-5 bg-yellow-50 dark:bg-neutral-800 border-2 border-yellow-200 dark:border-yellow-900 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-lg transition-all text-gray-900 dark:text-gray-100"
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
