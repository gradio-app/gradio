<script lang="ts">
	import version_json from "$lib/json/version.json";
	import DemosLanding from "$lib/components/DemosLanding.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import "$lib/assets/theme.css";

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
		<!-- Version Pill Badge -->
		<div class="mb-8">
			<a
				href="/changelog"
				class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wide transition-all hover:border-orange-200 dark:hover:border-orange-700"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"
					></span>
				</span>
				v{version}
			</a>
		</div>

		<!-- Main Heading -->
		<h1
			class="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 max-w-4xl"
		>
			Build machine learning apps in Python
		</h1>

		<!-- Subtitle -->
		<p
			class="mx-auto mb-12 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl"
		>
			Create web interfaces for your ML models in minutes. Deploy anywhere,
			share with anyone.
		</p>

		<!-- Buttons -->
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

		<!-- Component Preview Carousel -->
		<div class="w-full relative">
			<div class="overflow-hidden carousel-fade-container">
				<div class="animate-scroll-horizontal flex gap-4 py-4">
					<!-- Component previews -->
					{#each Array(16) as _, i}
						<div
							class="component-card flex-shrink-0 w-48 h-48 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center transition-all group p-4"
						>
							{#if i % 8 === 0}
								<MiniButton />{:else if i % 8 === 1}
								<MiniPlot />{:else if i % 8 === 2}
								<MiniDataframe />{:else if i % 8 === 3}
								<MiniImageSlider />{:else if i % 8 === 4}
								<MiniSlider />{:else if i % 8 === 5}
								<MiniGallery />{:else if i % 8 === 6}
								<MiniCheckbox />{:else if i % 8 === 7}
								<MiniCode />{/if}
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
								<MiniChatbot />{:else if i % 11 === 1}
								<MiniHighlightedText />{:else if i % 11 === 2}
								<MiniModel3D />{:else if i % 11 === 3}
								<MiniRadio />{:else if i % 11 === 4}
								<MiniNumber />{:else if i % 11 === 5}
								<MiniFileExplorer />{:else if i % 11 === 6}
								<MiniDraggable />{:else if i % 11 === 7}
								<MiniAudio />{:else if i % 11 === 8}
								<MiniAnnotatedImage />{:else if i % 11 === 9}
								<MiniDropdown />{:else if i % 11 === 10}
								<MiniDateTime />{/if}
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
			Gradio handles the frontend so you can focus on the machine learning. From
			prototypes to production-ready web apps.
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
				<h3 class="text-2xl font-bold mb-2">80+ Components</h3>
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
									<!-- Bot response -->
									<div class="flex justify-start">
										<div
											class="bg-gray-200 dark:bg-neutral-800 rounded-lg px-2 py-1 max-w-[70%]"
										>
											<div class="text-[8px] text-gray-600 dark:text-gray-300">
												It's sunny and 72°F today!
											</div>
										</div>
									</div>
									<!-- User message -->
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

	/* ImageSlider Handle */
	.image-slider-handle {
		box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.3);
		transition: opacity 0.2s;
	}

	.image-slider-container {
		cursor: grab;
	}

	.image-slider-container:active {
		cursor: grabbing;
	}

	/* Gradio Slider Styling */
	.gradio-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		cursor: pointer;
		outline: none;
		border-radius: 9999px;
		background: transparent;
		height: 0.5rem;
	}

	/* Webkit track */
	.gradio-slider::-webkit-slider-runnable-track {
		height: 0.5rem;
		border-radius: 9999px;
		background: linear-gradient(
			to right,
			rgb(249 115 22) var(--range-progress),
			rgb(229 231 235) var(--range-progress)
		);
	}

	@media (prefers-color-scheme: dark) {
		.gradio-slider::-webkit-slider-runnable-track {
			background: linear-gradient(
				to right,
				rgb(249 115 22) var(--range-progress),
				rgb(64 64 64) var(--range-progress)
			);
		}
	}

	/* Webkit thumb */
	.gradio-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 1rem;
		width: 1rem;
		background-color: white;
		border-radius: 50%;
		margin-top: -4px;
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	/* Firefox track */
	.gradio-slider::-moz-range-track {
		height: 0.5rem;
		background: rgb(229 231 235);
		border-radius: 9999px;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-slider::-moz-range-track {
			background: rgb(64 64 64);
		}
	}

	/* Firefox thumb */
	.gradio-slider::-moz-range-thumb {
		appearance: none;
		height: 1rem;
		width: 1rem;
		background-color: white;
		border-radius: 50%;
		border: none;
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	/* Firefox progress */
	.gradio-slider::-moz-range-progress {
		height: 0.5rem;
		background-color: rgb(249 115 22);
		border-radius: 9999px;
	}

	/* Mini Gallery Component - Gradio styling */
	.mini-gallery-container {
		width: 100%;
		height: 100%;
		max-height: 120px;
		position: relative;
	}

	.mini-gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 0.5rem;
		width: 100%;
		height: 100%;
	}

	.mini-gallery-large {
		width: 100%;
		height: 100%;
		border-radius: 0.375rem;
		border: 2px solid rgb(249 115 22);
		background: rgb(249 250 251);
		overflow: hidden;
		padding: 0;
		cursor: pointer;
		box-shadow:
			inset 0 0 0 1px rgb(249 115 22),
			0 2px 8px 0 rgba(249, 115, 22, 0.3);
		transition: all 0.2s ease;
	}

	.mini-gallery-large:hover {
		transform: scale(0.98);
	}

	.mini-gallery-large img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.mini-gallery-item {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 0.375rem;
		border: 1px solid rgb(229 231 235);
		background: rgb(249 250 251);
		overflow: hidden;
		box-shadow:
			inset 0 0 0 1px transparent,
			0 1px 3px 0 rgba(0, 0, 0, 0.1);
		transition: all 0.15s ease;
		padding: 0;
		cursor: pointer;
	}

	.mini-gallery-item:hover {
		border-color: rgb(249 115 22);
		box-shadow:
			inset 0 0 0 1px rgb(249 115 22),
			0 1px 3px 0 rgba(0, 0, 0, 0.1);
		filter: brightness(1.1);
		transform: scale(1.05);
	}

	.mini-gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	@media (prefers-color-scheme: dark) {
		.mini-gallery-large {
			background: rgb(38 38 38);
		}

		.mini-gallery-item {
			border-color: rgb(64 64 64);
			background: rgb(38 38 38);
		}

		.mini-gallery-item:hover {
			border-color: rgb(249 115 22);
		}
	}

	/* Mini Checkbox Component - Gradio styling */
	.gradio-checkbox-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.gradio-checkbox {
		appearance: none;
		-webkit-appearance: none;
		width: 1rem;
		height: 1rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 0.25rem;
		background-color: white;
		flex-shrink: 0;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
	}

	.gradio-checkbox:hover {
		border-color: rgb(209 213 219);
		background-color: rgb(249 250 251);
	}

	.gradio-checkbox:checked {
		background-color: rgb(249 115 22);
		border-color: rgb(249 115 22);
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		background-size: 100% 100%;
		background-position: center;
		background-repeat: no-repeat;
	}

	.gradio-checkbox-label {
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-checkbox {
			border-color: rgb(64 64 64);
			background-color: rgb(23 23 23);
		}

		.gradio-checkbox:hover {
			border-color: rgb(82 82 82);
			background-color: rgb(38 38 38);
		}

		.gradio-checkbox:checked {
			background-color: rgb(249 115 22);
			border-color: rgb(249 115 22);
		}

		.gradio-checkbox-label {
			color: rgb(229 231 235);
		}
	}

	/* Mini Code Component - Gradio styling */
	.gradio-code-container {
		display: flex;
		width: 100%;
		background-color: rgb(243 244 246);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		overflow: hidden;
		font-family: "IBM Plex Mono", ui-monospace, Consolas, monospace;
		font-size: 0.75rem;
		line-height: 1.25rem;
	}

	.gradio-code-gutter {
		display: flex;
		flex-direction: column;
		background-color: rgb(249 250 251);
		border-right: 1px solid rgb(229 231 235);
		padding: 0.25rem 0.5rem;
		color: rgb(156 163 175);
		text-align: right;
		user-select: none;
	}

	.gradio-code-line-number {
		display: block;
		line-height: 1.25rem;
	}

	.gradio-code-content {
		flex: 1;
		padding: 0.25rem 0.5rem;
		color: rgb(31 41 55);
	}

	.gradio-code-line {
		line-height: 1.25rem;
		white-space: nowrap;
	}

	.code-keyword {
		color: rgb(168 85 247);
		font-weight: 600;
	}

	.code-function {
		color: rgb(59 130 246);
	}

	.code-string {
		color: rgb(34 197 94);
	}

	.code-number {
		color: rgb(249 115 22);
	}

	@media (prefers-color-scheme: dark) {
		.gradio-code-container {
			background-color: rgb(23 23 23);
			border-color: rgb(64 64 64);
		}

		.gradio-code-gutter {
			background-color: rgb(38 38 38);
			border-color: rgb(64 64 64);
			color: rgb(115 115 115);
		}

		.gradio-code-content {
			color: rgb(229 231 235);
		}

		.code-keyword {
			color: rgb(196 181 253);
		}

		.code-function {
			color: rgb(147 197 253);
		}

		.code-string {
			color: rgb(134 239 172);
		}

		.code-number {
			color: rgb(251 146 60);
		}
	}

	/* Mini Chatbot Component - Gradio styling */
	.gradio-chatbot-wrapper {
		width: 100%;
		background: rgb(249 250 251);
		border-radius: 0.375rem;
		padding: 0.5rem;
		overflow: hidden;
	}

	.gradio-chatbot-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.gradio-chat-message {
		display: flex;
		width: 100%;
	}

	.gradio-chat-message.user {
		justify-content: flex-end;
	}

	.gradio-chat-message.bot {
		justify-content: flex-start;
	}

	.gradio-chat-bubble {
		max-width: 80%;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		line-height: 1rem;
		border: 1px solid;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		text-align: left;
	}

	.user-bubble {
		background-color: rgb(254 243 237);
		border-color: rgba(249, 115, 22, 0.3);
		color: rgb(31 41 55);
		border-bottom-right-radius: 0;
		align-self: flex-end;
		text-align: right;
	}

	.bot-bubble {
		background-color: rgb(243 244 246);
		border-color: rgb(229 231 235);
		color: rgb(31 41 55);
		border-bottom-left-radius: 0;
		align-self: flex-start;
		text-align: left;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-chatbot-wrapper {
			background: rgb(38 38 38);
		}

		.user-bubble {
			background-color: rgba(249, 115, 22, 0.15);
			border-color: rgba(249, 115, 22, 0.3);
			color: rgb(229 231 235);
		}

		.bot-bubble {
			background-color: rgb(38 38 38);
			border-color: rgb(64 64 64);
			color: rgb(229 231 235);
		}
	}

	/* Mini HighlightedText Component - Gradio styling */
	.gradio-highlighted-text {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.highlight-positive {
		background-color: rgb(187 247 208);
		color: rgb(22 101 52);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.highlight-neutral {
		background-color: rgb(229 231 235);
		color: rgb(31 41 55);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.highlight-negative {
		background-color: rgb(254 202 202);
		color: rgb(153 27 27);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	@media (prefers-color-scheme: dark) {
		.highlight-positive {
			background-color: rgb(22 101 52);
			color: rgb(187 247 208);
		}

		.highlight-neutral {
			background-color: rgb(64 64 64);
			color: rgb(229 231 235);
		}

		.highlight-negative {
			background-color: rgb(153 27 27);
			color: rgb(254 202 202);
		}
	}

	/* Mini Model3D Component - Gradio styling */
	.gradio-model3d-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			rgb(243 244 246) 0%,
			rgb(229 231 235) 100%
		);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
		min-height: 85px;
		pointer-events: none !important;
	}

	.model3d-scene {
		width: 60px;
		height: 60px;
		position: relative;
	}

	.model3d-cube {
		width: 100%;
		height: 100%;
		position: relative;
		animation: rotate2d 4s linear infinite;
		transform-origin: center center;
	}

	@keyframes rotate2d {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.cube-face {
		position: absolute;
		width: 60px;
		height: 60px;
		border: 2px solid rgb(249 115 22);
		opacity: 0.9;
		pointer-events: none !important;
		background: linear-gradient(
			135deg,
			rgba(249, 115, 22, 0.8),
			rgba(251, 146, 60, 0.6)
		);
	}

	.cube-face.front {
		top: 0;
		left: 0;
	}

	.cube-face.back {
		top: 0;
		left: 0;
		opacity: 0.3;
	}

	.cube-face.right {
		display: none;
	}

	.cube-face.left {
		display: none;
	}

	.cube-face.top {
		display: none;
	}

	.cube-face.bottom {
		display: none;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-model3d-container {
			background: linear-gradient(135deg, rgb(38 38 38) 0%, rgb(23 23 23) 100%);
			border-color: rgb(64 64 64);
		}
	}

	/* Mini Radio Component - Gradio styling */
	.gradio-radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gradio-radio-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.gradio-radio {
		appearance: none;
		-webkit-appearance: none;
		width: 1rem;
		height: 1rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 50%;
		background-color: white;
		flex-shrink: 0;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
	}

	.gradio-radio:hover {
		border-color: rgb(209 213 219);
		background-color: rgb(249 250 251);
	}

	.gradio-radio:checked {
		border-color: rgb(249 115 22);
		background-color: white;
	}

	.gradio-radio:checked::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.5rem;
		height: 0.5rem;
		background-color: rgb(249 115 22);
		border-radius: 50%;
	}

	.gradio-radio-label {
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-radio {
			border-color: rgb(64 64 64);
			background-color: rgb(23 23 23);
		}

		.gradio-radio:hover {
			border-color: rgb(82 82 82);
			background-color: rgb(38 38 38);
		}

		.gradio-radio:checked {
			border-color: rgb(249 115 22);
			background-color: rgb(23 23 23);
		}

		.gradio-radio-label {
			color: rgb(229 231 235);
		}
	}

	/* Mini Number Component - Gradio styling */
	.gradio-number-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 0.375rem;
		background-color: white;
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
		transition: all 0.15s ease;
	}

	.gradio-number-input:focus {
		outline: none;
		border-color: rgb(249 115 22);
		box-shadow: 0 0 0 1px rgb(249 115 22);
	}

	@media (prefers-color-scheme: dark) {
		.gradio-number-input {
			border-color: rgb(64 64 64);
			background-color: rgb(23 23 23);
			color: rgb(229 231 235);
		}

		.gradio-number-input:focus {
			border-color: rgb(249 115 22);
		}
	}

	/* Mini FileExplorer Component - Gradio styling */
	.gradio-fileexplorer {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
		font-size: 0.75rem;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.375rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.file-item:hover {
		background-color: rgb(243 244 246);
	}

	.file-indent {
		padding-left: 1.25rem;
	}

	.file-icon {
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.file-name {
		color: rgb(31 41 55);
		font-size: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-fileexplorer {
			background-color: rgb(23 23 23);
			border-color: rgb(64 64 64);
		}

		.file-item:hover {
			background-color: rgb(38 38 38);
		}

		.file-name {
			color: rgb(229 231 235);
		}
	}

	/* Mini Draggable Component - Gradio styling */
	.gradio-draggable {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	.draggable-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		background-color: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.25rem;
		margin-bottom: 0.375rem;
		cursor: move;
		transition: all 0.15s ease;
	}

	.draggable-item:last-child {
		margin-bottom: 0;
	}

	.draggable-item:hover {
		background-color: rgb(243 244 246);
		border-color: rgb(209 213 219);
	}

	.draggable-item.drag-over {
		border-color: rgb(249 115 22);
		background-color: rgba(249, 115, 22, 0.1);
	}

	.drag-handle {
		color: rgb(156 163 175);
		font-size: 0.75rem;
		cursor: grab;
		user-select: none;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.draggable-content {
		color: rgb(31 41 55);
		font-size: 0.75rem;
		flex: 1;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-draggable {
			background-color: rgb(23 23 23);
			border-color: rgb(64 64 64);
		}

		.draggable-item {
			background-color: rgb(38 38 38);
			border-color: rgb(64 64 64);
		}

		.draggable-item:hover {
			background-color: rgb(50 50 50);
			border-color: rgb(82 82 82);
		}

		.draggable-item.drag-over {
			border-color: rgb(249 115 22);
			background-color: rgba(249, 115, 22, 0.15);
		}

		.drag-handle {
			color: rgb(115 115 115);
		}

		.draggable-content {
			color: rgb(229 231 235);
		}
	}

	/* Mini Audio Component - Gradio styling */
	.gradio-audio {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	.audio-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.audio-play-btn {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(249 115 22);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.625rem;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.audio-play-btn:hover {
		background-color: rgb(234 88 12);
	}

	.audio-waveform {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 1.5rem;
	}

	.waveform-bar {
		background: rgb(249 115 22);
		border-radius: 0.125rem;
		width: 1px;
	}

	.audio-time {
		color: rgb(107 114 128);
		font-size: 0.625rem;
		font-family: ui-monospace, monospace;
		flex-shrink: 0;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-audio {
			background-color: rgb(23 23 23);
			border-color: rgb(64 64 64);
		}

		.audio-time {
			color: rgb(156 163 175);
		}
	}

	/* Mini AnnotatedImage Component - Gradio styling */
	.annotated-image-wrapper {
		width: 100%;
		position: relative;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.annotated-image-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.annotated-base-image {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.annotation-mask {
		position: absolute;
		opacity: 0.85;
		transition: opacity 0.2s ease-in-out;
		pointer-events: none;
	}

	.annotated-image-container:hover .annotation-mask {
		opacity: 0.3;
	}

	.annotation-mask-1 {
		top: 20%;
		left: 25%;
		width: 50%;
		height: 55%;
		background: radial-gradient(
			ellipse at center,
			hsla(0, 100%, 50%, 0.7) 0%,
			hsla(0, 100%, 50%, 0.5) 40%,
			transparent 70%
		);
	}

	.annotation-mask-2 {
		top: 15%;
		right: 10%;
		width: 35%;
		height: 40%;
		background: radial-gradient(
			ellipse at center,
			hsla(120, 100%, 50%, 0.7) 0%,
			hsla(120, 100%, 50%, 0.5) 40%,
			transparent 70%
		);
	}

	.annotation-legend {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.legend-item {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		color: rgb(31 41 55);
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: all 0.15s ease;
	}

	.legend-item:hover {
		opacity: 0.8;
	}

	.legend-item.legend-1 {
		background-color: hsla(0, 100%, 50%, 0.3);
	}

	.legend-item.legend-2 {
		background-color: hsla(120, 100%, 50%, 0.3);
	}

	@media (prefers-color-scheme: dark) {
		.legend-item {
			color: rgb(229 231 235);
		}
	}

	/* Mini Dropdown Component - Gradio styling */
	.gradio-dropdown {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid rgb(209 213 219);
		border-radius: 0.375rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		user-select: none;
	}

	.dropdown-display {
		flex: 1;
		margin: 0.25rem;
		padding: 0.25rem;
		color: rgb(31 41 55);
		font-size: 0.75rem;
	}

	.dropdown-arrow-icon {
		position: absolute;
		right: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		width: 0.875rem;
		height: 0.875rem;
		color: rgb(31 41 55);
		pointer-events: none;
	}

	.dropdown-arrow-icon svg {
		width: 100%;
		height: 100%;
	}

	/* Mini DateTime Component - Gradio styling */
	.gradio-datetime {
		display: flex;
		width: 100%;
		background: white;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.datetime-input {
		flex: 1;
		padding: 0.375rem 0.5rem;
		border: 1px solid rgb(229 231 235);
		border-right: none;
		border-top-left-radius: 0.375rem;
		border-bottom-left-radius: 0.375rem;
		background: transparent;
		outline: none;
		color: rgb(31 41 55);
		font-size: 0.75rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.datetime-calendar-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.5rem;
		border: 1px solid rgb(229 231 235);
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
		background: white;
		color: rgb(107 114 128);
		cursor: pointer;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		transition: color 0.15s ease;
	}

	.datetime-calendar-btn:hover {
		color: rgb(31 41 55);
	}

	.datetime-calendar-btn svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	@media (prefers-color-scheme: dark) {
		.gradio-dropdown {
			background: rgb(38 38 38);
			border-color: rgb(82 82 82);
		}

		.dropdown-display {
			color: rgb(229 231 235);
		}

		.dropdown-arrow-icon {
			color: rgb(229 231 235);
		}

		.gradio-datetime {
			background: rgb(38 38 38);
		}

		.datetime-input {
			background: rgb(38 38 38);
			border-color: rgb(64 64 64);
			color: rgb(229 231 235);
		}

		.datetime-calendar-btn {
			background: rgb(38 38 38);
			border-color: rgb(64 64 64);
			color: rgb(156 163 175);
		}

		.datetime-calendar-btn:hover {
			color: rgb(229 231 235);
		}
	}

	/* Component Card Hover */
	.component-card {
		overflow: hidden;
		isolation: isolate;
	}

	.component-card:hover {
		border-color: rgb(249 115 22);
	}
</style>
