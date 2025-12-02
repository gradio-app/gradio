<script lang="ts">
	import version_json from "$lib/json/version.json";
	import DemosLanding from "$lib/components/DemosLanding.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import Banner from "$lib/components/Banner.svelte";
	import MiniButton from "$lib/components/mini/MiniButton.svelte";
	import MiniPlot from "$lib/components/mini/MiniPlot.svelte";
	import MiniDataframe from "$lib/components/mini/MiniDataframe.svelte";
	import MiniImageSlider from "$lib/components/mini/MiniImageSlider.svelte";
	import MiniSlider from "$lib/components/mini/MiniSlider.svelte";
	import MiniGallery from "$lib/components/mini/MiniGallery.svelte";
	import MiniCheckbox from "$lib/components/mini/MiniCheckbox.svelte";
	import MiniCode from "$lib/components/mini/MiniCode.svelte";
	import MiniChatbot from "$lib/components/mini/MiniChatbot.svelte";
	import MiniHighlightedText from "$lib/components/mini/MiniHighlightedText.svelte";
	import MiniModel3D from "$lib/components/mini/MiniModel3D.svelte";
	import MiniRadio from "$lib/components/mini/MiniRadio.svelte";
	import MiniNumber from "$lib/components/mini/MiniNumber.svelte";
	import MiniFileExplorer from "$lib/components/mini/MiniFileExplorer.svelte";
	import MiniDraggable from "$lib/components/mini/MiniDraggable.svelte";
	import MiniAudio from "$lib/components/mini/MiniAudio.svelte";
	import MiniAnnotatedImage from "$lib/components/mini/MiniAnnotatedImage.svelte";
	import MiniDropdown from "$lib/components/mini/MiniDropdown.svelte";
	import MiniDateTime from "$lib/components/mini/MiniDateTime.svelte";

	import "$lib/assets/theme.css";
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

<div class="container relative mx-auto px-4 pt-16 pb-12">
	<div class="flex flex-col items-center text-center">
		<div class="mb-8 flex flex-wrap items-center justify-center gap-3">
			<Banner
				id="gradio-6-release"
				message="Gradio 6 is here!"
				link_text="Learn more"
				link_url="/docs/gradio"
			/>
			<Banner
				id="hackathon-deadline"
				message="MCP Birthday Hackathon Completed!"
				link_text="See Submissions"
				link_url="https://huggingface.co/MCP-1st-Birthday/spaces"
				target="_blank"
			/>
		</div>

		<h1
			class="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 max-w-4xl"
		>
			Build machine learning apps in Python
		</h1>

		<p
			class="mx-auto mb-12 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl"
		>
			Create web interfaces for your ML models in minutes. Deploy anywhere,
			share with anyone.
		</p>

		<div
			class="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto mb-20"
		>
			<a
				href="/guides/quickstart"
				class="h-12 px-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
			>
				Get Started
			</a>
			<a
				href="https://github.com/gradio-app/gradio"
				class="h-12 px-6 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2 transition-all"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				GitHub
				<span
					class="ml-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-gray-500 dark:text-gray-400 font-mono"
					>{data.star_count}</span
				>
			</a>
		</div>
		<div class="w-full relative">
			<div class="overflow-hidden carousel-fade-container">
				<div class="animate-scroll-horizontal flex gap-4 py-4">
					{#each Array(16) as _, i}
						<div
							class="component-card flex-shrink-0 w-48 h-48 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center transition-all group p-4"
						>
							{#if i % 8 === 0}
								<MiniButton />
							{:else if i % 8 === 1}
								<MiniPlot />
							{:else if i % 8 === 2}
								<MiniDataframe />
							{:else if i % 8 === 3}
								<MiniImageSlider />
							{:else if i % 8 === 4}
								<MiniSlider />
							{:else if i % 8 === 5}
								<MiniGallery />
							{:else if i % 8 === 6}
								<MiniCheckbox />
							{:else if i % 8 === 7}
								<MiniCode />
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="overflow-hidden carousel-fade-container mt-1">
				<div class="animate-scroll-horizontal-reverse flex gap-4">
					{#each Array(22) as _, i}
						<div
							class="component-card flex-shrink-0 w-48 h-48 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center transition-all group p-4"
						>
							{#if i % 11 === 0}
								<MiniChatbot />
							{:else if i % 11 === 1}
								<MiniHighlightedText />
							{:else if i % 11 === 2}
								<MiniModel3D />
							{:else if i % 11 === 3}
								<MiniRadio />
							{:else if i % 11 === 4}
								<MiniNumber />
							{:else if i % 11 === 5}
								<MiniFileExplorer />
							{:else if i % 11 === 6}
								<MiniDraggable />
							{:else if i % 11 === 7}
								<MiniAudio />
							{:else if i % 11 === 8}
								<MiniAnnotatedImage />
							{:else if i % 11 === 9}
								<MiniDropdown />
							{:else if i % 11 === 10}
								<MiniDateTime />
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-24 md:py-32">
	<div class="mb-16 text-center max-w-3xl mx-auto">
		<h2
			class="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white"
		>
			Everything you need to build
		</h2>
		<p class="text-lg text-gray-600 dark:text-gray-400">
			Gradio handles the frontend so you can focus on building. From prototypes
			to production-ready web apps.
		</p>
	</div>

	<div
		class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]"
	>
		<div
			class="group md:col-span-2 relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-8 transition-all hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10"
		>
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div class="relative z-10">
					<div
						class="h-12 w-12 mb-6 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400"
					>
						<svg
							class="w-6 h-6"
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
					<h3 class="text-2xl font-bold mb-2">Lightning Fast Setup</h3>
					<p class="text-gray-600 dark:text-gray-400">
						One command to install. A few lines of Python to launch. No
						Javascript, CSS, or frontend experience required.
					</p>
				</div>
				<div
					class="relative bg-neutral-800 dark:bg-neutral-950 rounded-xl border border-neutral-700 dark:border-neutral-800 font-mono text-xs text-gray-300 shadow-xl group-hover:shadow-2xl transition-shadow flex flex-col justify-center p-4 self-end"
				>
					<div>
						<div class="flex gap-1.5 mb-3">
							<div class="w-2 h-2 rounded-full bg-red-500"></div>
							<div class="w-2 h-2 rounded-full bg-yellow-500"></div>
							<div class="w-2 h-2 rounded-full bg-green-500"></div>
						</div>
						<p class="text-gray-400">
							$ <span class="text-gray-300">pip install gradio</span>
						</p>
						<p class="text-green-400 mt-1">Successfully installed gradio</p>
						<p class="mt-3 text-gray-400">
							$ <span class="text-gray-300">python app.py</span>
						</p>
						<p class="text-blue-400 mt-1">Running on http://127.0.0.1:7860</p>
					</div>
				</div>
			</div>
		</div>
		<div
			class="group relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-8 transition-all hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10"
		>
			<div class="relative z-10 h-full flex flex-col">
				<div
					class="h-12 w-12 mb-6 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400"
				>
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
				</div>
				<h3 class="text-2xl font-bold mb-2">40+ Components</h3>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Input and output for any data type: Images, Audio, Video, 3D,
					Dataframes, and more.
				</p>

				<div class="mt-auto flex flex-wrap gap-2">
					{#each ["Audio", "Image", "Chat", "Video", "Plot", "JSON"] as item}
						<span
							class="px-2 py-1 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-medium"
							>{item}</span
						>
					{/each}
					<span class="px-2 py-1 text-xs text-gray-500">+ many more</span>
				</div>
			</div>
		</div>
		<div
			class="group relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-8 transition-all hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10"
		>
			<div class="relative z-10">
				<div
					class="h-12 w-12 mb-6 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400"
				>
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
						/>
					</svg>
				</div>
				<h3 class="text-2xl font-bold mb-2">Permanent Hosting</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Deploy to Hugging Face Spaces for free. Always online, auto-scaling,
					and shareable with a simple URL.
				</p>
				<div
					class="mt-6 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
				>
					<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
					Live on HF Spaces
				</div>
			</div>
		</div>
		<div
			class="group md:col-span-2 relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-8 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
		>
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div class="relative z-10">
					<div
						class="h-12 w-12 mb-6 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"
					>
						<svg
							class="w-6 h-6"
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
					<h3 class="text-2xl font-bold mb-2">Share Instantly</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Create a public link to your machine learning demo running on your
						local computer in seconds. Great for showing clients or colleagues.
					</p>
					<div
						class="mt-6 inline-flex items-center px-3 py-2 rounded-lg border border-neutral-700 dark:border-neutral-800 bg-neutral-800 dark:bg-neutral-950 font-mono text-sm text-gray-300"
					>
						demo.launch(share=<span class="text-blue-400">True</span>)
					</div>
				</div>
				<div
					class="relative h-full min-h-[240px] bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 flex flex-col justify-between overflow-hidden"
				>
					<div
						class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-2xl"
					></div>
					<div
						class="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-indigo-200/30 dark:bg-indigo-800/20 blur-2xl"
					></div>
					<div
						class="relative z-10 space-y-4 flex flex-col items-center justify-center h-full"
					>
						<div class="flex justify-center">
							<span
								class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
								></span>
								Live
							</span>
						</div>

						<div
							class="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 overflow-hidden w-full max-w-sm"
						>
							<div
								class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700"
							>
								<div class="flex gap-1.5">
									<div class="w-2 h-2 rounded-full bg-red-400"></div>
									<div class="w-2 h-2 rounded-full bg-yellow-400"></div>
									<div class="w-2 h-2 rounded-full bg-green-400"></div>
								</div>
							</div>
							<div
								class="px-4 py-2 text-center font-mono text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700"
							>
								https://78620.gradio.app
							</div>
							<div class="p-3 bg-gray-50 dark:bg-neutral-900 space-y-2">
								<div class="space-y-1.5">
									<div class="flex justify-end">
										<div
											class="bg-orange-100 dark:bg-orange-900/30 rounded-lg px-2 py-1 max-w-[70%]"
										>
											<div class="text-[8px] text-gray-600 dark:text-gray-400">
												What's the weather like?
											</div>
										</div>
									</div>
									<div class="flex justify-start">
										<div
											class="bg-gray-200 dark:bg-neutral-800 rounded-lg px-2 py-1 max-w-[70%]"
										>
											<div class="text-[8px] text-gray-600 dark:text-gray-300">
												It's sunny and 72°F today!
											</div>
										</div>
									</div>
									<div class="flex justify-end">
										<div
											class="bg-orange-100 dark:bg-orange-900/30 rounded-lg px-2 py-1 max-w-[70%]"
										>
											<div class="text-[8px] text-gray-600 dark:text-gray-400">
												Perfect, thanks!
											</div>
										</div>
									</div>
								</div>
								<div class="pt-1">
									<div
										class="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded px-2 py-1 text-[8px] text-gray-400 dark:text-gray-500"
									>
										...
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<DemosLanding />
<div class="pt-12 md:pt-20 mx-auto container px-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.tweets as tweet}
			<a
				href={tweet["link"]}
				class="rounded-xl border border-gray-200 bg-white p-4 hover:shadow dark:border-gray-800 dark:bg-neutral-800"
			>
				<div class="flex justify-between">
					<div class="flex items-center gap-2">
						<img
							class="h-11 w-11 rounded-full"
							src={tweet.profile_pic}
							alt=""
						/>
						<div class="ml-1.5 text-sm leading-tight">
							<span class="block font-bold text-black dark:text-white"
								>{tweet["name"]}</span
							>
							<span class="block font-normal text-gray-500 dark:text-gray-400"
								>@{tweet["handle"]}</span
							>
						</div>
					</div>
					<svg
						class="inline-block h-6 w-auto text-blue-400 dark:text-white"
						viewBox="0 0 512 512"
					>
						<g>
							<path
								d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
							/>
						</g>
					</svg>
				</div>
				<p class="mt-3 block leading-snug text-black dark:text-white">
					{@html tweet["content"]}
				</p>
			</a>
		{/each}
	</div>
</div>

<!--
<a href="/{version}/docs"></a>
<a href="/{version}/guide"></a> -->
<a style="display: none;" href="/main/docs"></a>
<a style="display: none;" href="/main/guides"></a>

<style>
	@keyframes scroll-horizontal {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.animate-scroll-horizontal {
		animation: scroll-horizontal 30s linear infinite;
		width: fit-content;
	}

	.animate-scroll-horizontal:hover {
		animation-play-state: paused;
	}

	@keyframes scroll-horizontal-reverse {
		0% {
			transform: translateX(-50%);
		}
		100% {
			transform: translateX(0);
		}
	}

	.animate-scroll-horizontal-reverse {
		animation: scroll-horizontal-reverse 30s linear infinite;
		width: fit-content;
	}

	.animate-scroll-horizontal-reverse:hover {
		animation-play-state: paused;
	}

	.carousel-fade-container {
		-webkit-mask-image: linear-gradient(
			to right,
			transparent,
			black 15%,
			black 85%,
			transparent
		);
		mask-image: linear-gradient(
			to right,
			transparent,
			black 15%,
			black 85%,
			transparent
		);
	}

	.component-card {
		overflow: hidden;
		isolation: isolate;
	}

	.component-card:hover {
		border-color: rgb(249 115 22);
	}
</style>
