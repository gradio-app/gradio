<script lang="ts">
	import version_json from "$lib/json/version.json";
	import DemosLanding from "$lib/components/DemosLanding.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	export let data: {
		logos: {
			img: string;
			contrast: boolean;
			description: string;
		}[];
		tweets: {
			profile_pic: string;
			name: string;
			handle: string;
			link: string;
			content: string;
			likes: number;
			timestamp: string;
		}[];
		star_count: any;
	};

	let version = version_json.version;
</script>

<MetaTags url={"https://gradio.app"} canonical={"https://gradio.app"} />

<svelte:head>
	<script
		id="gradio-js-script"
		type="module"
		src="https://gradio.s3-us-west-2.amazonaws.com/{version.replace(
			'b',
			'-beta.'
		)}/gradio.js"
	></script>
</svelte:head>

<div class="relative overflow-hidden">
	<div
		class="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-gray-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 -z-10"
	></div>

	<div class="container relative mx-auto px-4 pt-20 pb-32 lg:pt-32 lg:pb-40">
		<div class="max-w-4xl mx-auto text-center">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gray-50/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-gray-200 dark:border-neutral-700 shadow-sm"
			>
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					The fastest way to build ML web apps
				</span>
			</div>
			<h1
				class="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
			>
				Build & Share
				<span
					class="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent"
				>
					Delightful
				</span>
				<br />
				Machine Learning Apps
			</h1>
			<p
				class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
			>
				Turn your Python functions into interactive web apps in minutes. No
				frontend experience required.
			</p>
			<div
				class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
			>
				<a
					href="/guides/quickstart"
					class="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-200"
				>
					Get Started
					<svg
						class="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>

				<a
					href="https://github.com/gradio-app/gradio"
					class="group px-8 py-4 rounded-xl bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white font-semibold text-lg border-2 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
				>
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span class="flex items-center gap-2">
						Star on GitHub
						<span
							class="px-2 py-0.5 text-sm bg-gray-100 dark:bg-neutral-700 rounded-full"
							>{data.star_count}</span
						>
					</span>
				</a>
			</div>
			<div
				class="inline-block bg-gray-900 dark:bg-neutral-800 rounded-lg px-6 py-4 shadow-lg"
			>
				<code class="text-sm font-mono text-gray-100 dark:text-gray-300">
					<span class="text-gray-400">$</span> pip install gradio
				</code>
			</div>
		</div>
	</div>
</div>

<div class="relative overflow-hidden py-20">
	<div class="absolute inset-0 bg-gray-50 dark:bg-neutral-950 -z-10"></div>
	<div
		class="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
	></div>
	<div
		class="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
	></div>

	<div class="relative">
		<div class="container mx-auto px-4 mb-12">
			<div class="text-center max-w-3xl mx-auto">
				<div class="inline-block mb-4">
					<span
						class="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium"
					>
						Interactive Examples
					</span>
				</div>
				<h2
					class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
				>
					See Gradio in Action
				</h2>
				<p class="text-lg md:text-xl text-gray-600 dark:text-gray-400">
					Explore live demos built with just a few lines of Python code
				</p>
			</div>
		</div>
		<DemosLanding />
	</div>
</div>

<div class="relative overflow-hidden py-24">
	<div
		class="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 -z-10"
	></div>
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div
			class="absolute top-20 left-10 w-72 h-72 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"
		></div>
		<div
			class="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-3xl animate-pulse-slow"
			style="animation-delay: 1s;"
		></div>
	</div>

	<div class="container mx-auto px-4 relative">
		<div class="text-center max-w-4xl mx-auto mb-20">
			<div class="inline-block mb-4">
				<span
					class="px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold"
				>
					Why Choose Gradio
				</span>
			</div>
			<h2
				class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
			>
				Build ML apps in
				<span class="relative inline-block">
					<span
						class="relative z-10 bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent"
						>minutes</span
					>
					<svg
						class="absolute -bottom-2 left-0 w-full h-3"
						viewBox="0 0 200 12"
						preserveAspectRatio="none"
					>
						<path
							d="M0,7 Q50,0 100,7 T200,7"
							fill="none"
							stroke="url(#gradient)"
							stroke-width="3"
							class="animate-draw"
						/>
						<defs>
							<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop
									offset="0%"
									style="stop-color:rgb(249,115,22);stop-opacity:0.5"
								/>
								<stop
									offset="100%"
									style="stop-color:rgb(234,179,8);stop-opacity:0.5"
								/>
							</linearGradient>
						</defs>
					</svg>
				</span>
				not days
			</h2>
			<p
				class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed"
			>
				Everything you need to share your ML models with the world
			</p>
		</div>
		<div
			class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
		>
			<div
				class="lg:col-span-2 group relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-900/50 rounded-3xl p-8 md:p-10 border border-gray-200 dark:border-neutral-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:to-yellow-500/5 transition-all duration-500 rounded-3xl"
				></div>

				<div class="relative z-10">
					<div class="flex items-start justify-between mb-8">
						<div
							class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
						>
							<svg
								class="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div class="text-right">
							<div
								class="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
							>
								&lt; 5 min
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
								to deploy
							</div>
						</div>
					</div>

					<h3
						class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
					>
						Lightning Fast Setup
					</h3>
					<p
						class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6"
					>
						One command to install. A few lines of Python to launch. If you can
						write a function, you can build a Gradio app.
					</p>
					<div
						class="bg-white dark:bg-gray-900 rounded-2xl p-6 font-mono text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm"
					>
						<div class="flex items-center gap-2 mb-4">
							<div class="flex gap-1.5">
								<div class="w-3 h-3 rounded-full bg-red-500/80"></div>
								<div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
								<div class="w-3 h-3 rounded-full bg-green-500/80"></div>
							</div>
							<span class="text-gray-500 dark:text-gray-400 text-xs ml-2"
								>terminal</span
							>
						</div>
						<div class="space-y-2">
							<div>
								<span class="text-gray-400 dark:text-gray-500">$</span>
								<span class="text-green-600 dark:text-green-400"
									>pip install</span
								>
								<span class="text-blue-600 dark:text-blue-400">gradio</span>
							</div>
							<div>
								<span class="text-gray-400 dark:text-gray-500">$</span>
								<span class="text-green-600 dark:text-green-400">python</span>
								<span class="text-purple-600 dark:text-purple-400">app.py</span>
							</div>
							<div class="text-gray-500 dark:text-gray-400">
								✓ Running on local URL: http://127.0.0.1:7860
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="group relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-900/50 rounded-3xl p-8 border border-gray-200 dark:border-neutral-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:to-yellow-500/5 transition-all duration-500 rounded-3xl"
				></div>

				<div class="relative z-10 h-full flex flex-col">
					<div
						class="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
					>
						<svg
							class="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
					</div>

					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Share Instantly
					</h3>
					<p
						class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-grow"
					>
						Generate shareable links in seconds. Embed in notebooks or deploy as
						standalone apps.
					</p>

					<div class="flex items-center gap-2 text-sm">
						<div
							class="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg font-medium"
						>
							Notebooks
						</div>
						<div
							class="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg font-medium"
						>
							Web Apps
						</div>
					</div>
				</div>
			</div>

			<div
				class="group relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-900/50 rounded-3xl p-8 border border-gray-200 dark:border-neutral-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:to-yellow-500/5 transition-all duration-500 rounded-3xl"
				></div>

				<div class="relative z-10 h-full flex flex-col">
					<div
						class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
					>
						<svg
							class="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>

					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Free Hosting
					</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
						Deploy to Hugging Face Spaces for permanent, free hosting. No DevOps
						required.
					</p>

					<div class="mt-6">
						<div
							class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
						>
							<svg
								class="w-4 h-4 text-green-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Always online</span>
						</div>
						<div
							class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2"
						>
							<svg
								class="w-4 h-4 text-green-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Auto-scaling</span>
						</div>
					</div>
				</div>
			</div>
			<div
				class="lg:col-span-2 group relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-900/50 rounded-3xl p-8 border border-gray-200 dark:border-neutral-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:to-yellow-500/5 transition-all duration-500 rounded-3xl"
				></div>

				<div class="relative z-10">
					<div class="flex items-start justify-between mb-6">
						<div
							class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
						>
							<svg
								class="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
								/>
							</svg>
						</div>
						<div class="text-right">
							<div
								class="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
							>
								80+
							</div>
							<div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
								components
							</div>
						</div>
					</div>

					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Rich Component Library
					</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
						From text and images to audio, video, and 3D models. Build any
						interface you can imagine.
					</p>
					<div class="flex flex-wrap gap-2">
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							Chatbot
						</div>
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							Audio
						</div>
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							Video
						</div>
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							3D Model
						</div>
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							DataFrames
						</div>
						<div
							class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
						>
							& more...
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="relative py-24">
	<div class="absolute inset-0 bg-gray-50 dark:bg-neutral-950 -z-10"></div>
	<div class="container mx-auto px-4">
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2
				class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
			>
				Loved by the ML Community
			</h2>
			<p class="text-lg text-gray-600 dark:text-gray-400">
				See what developers and researchers are building with Gradio
			</p>
		</div>

		<div
			class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
		>
			{#each data.tweets as tweet}
				<a
					href={tweet["link"]}
					class="group relative bg-gray-50 dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6 hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-300"
				>
					<div class="flex justify-between items-start mb-4">
						<div class="flex items-center gap-3">
							<img
								class="h-12 w-12 rounded-full ring-2 ring-gray-100 dark:ring-neutral-700"
								src={tweet.profile_pic}
								alt={tweet.name}
							/>
							<div class="text-sm">
								<div class="font-bold text-gray-900 dark:text-white">
									{tweet["name"]}
								</div>
								<div class="text-gray-500 dark:text-gray-400">
									@{tweet["handle"]}
								</div>
							</div>
						</div>
						<svg
							class="w-5 h-5 text-gray-400 dark:text-neutral-600 group-hover:text-orange-500 transition-colors"
							viewBox="0 0 512 512"
							fill="currentColor"
						>
							<path
								d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
							/>
						</svg>
					</div>
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						{@html tweet["content"]}
					</p>
				</a>
			{/each}
		</div>
	</div>
</div>
<!-- 
<a href="/{version}/docs"></a>
<a href="/{version}/guide"></a> -->
<a style="display: none;" href="/main/docs"></a>
<a style="display: none;" href="/main/guides"></a>

<style>
	@keyframes pulse-slow {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.05);
		}
	}

	.animate-pulse-slow {
		animation: pulse-slow 8s ease-in-out infinite;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	.animate-draw {
		stroke-dasharray: 1000;
		stroke-dashoffset: 1000;
		animation: draw 2s ease-out forwards;
	}
</style>
