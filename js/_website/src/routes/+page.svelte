<script lang="ts">
	import version_json from "$lib/json/version.json";
	import DemosLanding from "$lib/components/DemosLanding.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import gradio_banner from "$lib/assets/img/header-image.png";
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

<div class="relative overflow-hidden">
	<div
		class="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-gray-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 -z-10"
	></div>

	<div class="container relative mx-auto px-4 pt-20 pb-32 lg:pt-32 lg:pb-40">
		<div class="max-w-4xl mx-auto text-center">
			<div
				class="mb-10 text-4xl font-bold capitalize text-gray-900 dark:text-gray-100 xl:-ml-52 xl:text-5xl 2xl:text-6xl"
			>
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					The fastest way to build ML web apps
				</span>
			</div>
			<div class="lg:pl-12">
				<p class="mx-auto mb-12 text-xl text-gray-600 dark:text-gray-300">
					Gradio is the fastest way to demo your machine learning model with a
					friendly web interface so that anyone can use it, anywhere!
				</p>
				<div
					class="flex flex-col md:flex-row space-x-4 justify-center lg:justify-start"
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
					<div class="flex items-center justify-center">
						<a
							href="https://github.com/gradio-app/gradio"
							class="cursor-pointer select-none inline-flex justify-center items-center whitespace-nowrap px-3 py-1 rounded-lg border bg-gradient-to-b focus:outline-none focus:ring text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 from-white to-gray-100 dark:from-neutral-800 dark:to-neutral-900 hover:shadow-inner font-bold text-lg -mr-1"
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
								class="absolute z-[-1] -left-1 top-3 h-3 w-3 bg-gradient-to-t from-gray-100 to-white dark:from-neutral-900 dark:to-neutral-800 rounded-sm border border-gray-200 dark:border-gray-700 flex-none transform rotate-45"
							/>
							<a
								id="star-count"
								class="inset-0 cursor-pointer select-none inline-flex justify-center items-center whitespace-nowrap px-3 py-1 rounded-lg border bg-gradient-to-b focus:outline-none focus:ring text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 from-white to-gray-100 dark:from-neutral-800 dark:to-neutral-900 hover:shadow-inner font-bold text-lg dark:hover:text-yellow-500 relative"
								href="https://github.com/gradio-app/gradio">{data.star_count}</a
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
<DemosLanding />
<div
	class="relative mx-auto container space-y-6 px-4 py-24 md:flex md:space-y-0 md:space-x-8 text-lg"
>
	<div
		class="shadow-alternate flex-1 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-neutral-900 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
			<svg
				class="mr-2 mb-3 text-2xl text-gray-800 dark:text-gray-200"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				aria-hidden="true"
				fill="currentColor"
				focusable="false"
				role="img"
				width="1em"
				height="1em"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 32 32"
			>
				<rect
					class="text-orange-500"
					x="6.34"
					y="19"
					width="11.31"
					height="2"
					transform="translate(-10.63 14.34) rotate(-45)"
				/>
				<path
					d="M17,30a1,1,0,0,1-.37-.07,1,1,0,0,1-.62-.79l-1-7,2-.28.75,5.27L21,24.52V17a1,1,0,0,1,.29-.71l4.07-4.07A8.94,8.94,0,0,0,28,5.86V4H26.14a8.94,8.94,0,0,0-6.36,2.64l-4.07,4.07A1,1,0,0,1,15,11H7.48L4.87,14.26l5.27.75-.28,2-7-1a1,1,0,0,1-.79-.62,1,1,0,0,1,.15-1l4-5A1,1,0,0,1,7,9h7.59l3.77-3.78A10.92,10.92,0,0,1,26.14,2H28a2,2,0,0,1,2,2V5.86a10.92,10.92,0,0,1-3.22,7.78L23,17.41V25a1,1,0,0,1-.38.78l-5,4A1,1,0,0,1,17,30Z"
				/>
			</svg>
			Fast, easy setup
		</h2>
		<p class="mb-3 text-gray-600 dark:text-gray-300">
			Gradio can be <a class="text-link" href="/guides/quickstart"
				>installed with pip</a
			>. Creating a Gradio interface only requires adding a couple lines of code
			to your project.
		</p>
		<p class="text-gray-600 dark:text-gray-300">
			Seamlessly use any python library on your computer. If you can write a
			python function, gradio can run it.
		</p>
	</div>
	<div
		class="shadow-alternate flex-1 rounded-xl border border-t border-gray-100 dark:border-gray-800 dark:bg-neutral-900 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
			<svg
				width="1em"
				height="1em"
				class="mr-2 mb-3 fill-current text-2xl text-gray-800 dark:text-gray-200"
				viewBox="0 0 1 1"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M0.675 0.590576H0.73125V0.731201H0.675V0.590576ZM0.5625 0.449951H0.61875V0.731201H0.5625V0.449951Z"
				/>
				<path
					class="text-orange-500"
					d="M0.210183 0.689964C0.236545 0.716326 0.272288 0.731157 0.30957 0.731201C0.346866 0.731201 0.382635 0.716385 0.409007 0.690013C0.43538 0.663641 0.450195 0.627872 0.450195 0.590576C0.450195 0.55328 0.43538 0.517512 0.409007 0.491139C0.382635 0.464767 0.346866 0.449951 0.30957 0.449951V0.506201C0.326258 0.506201 0.342571 0.51115 0.356447 0.520421C0.370322 0.529692 0.381137 0.54287 0.387523 0.558287C0.393909 0.573705 0.39558 0.59067 0.392324 0.607037C0.389068 0.623404 0.381032 0.638438 0.369232 0.650238C0.357432 0.662038 0.342398 0.670074 0.326031 0.67333C0.309664 0.676586 0.292699 0.674915 0.277281 0.668529C0.261864 0.662142 0.248686 0.651328 0.239415 0.637452C0.230144 0.623577 0.225195 0.607264 0.225195 0.590576H0.168945C0.16899 0.627859 0.18382 0.663601 0.210183 0.689964Z"
				/>
				<path
					d="M0.787402 0.0561523H0.112402C0.0974885 0.0561672 0.0831897 0.0620983 0.072644 0.072644C0.0620983 0.0831897 0.0561672 0.0974885 0.0561523 0.112402V0.787402C0.0561672 0.802316 0.0620983 0.816615 0.072644 0.827161C0.0831897 0.837706 0.0974885 0.843637 0.112402 0.843652H0.787402C0.802314 0.84363 0.816608 0.837697 0.827152 0.827152C0.837697 0.816608 0.84363 0.802314 0.843652 0.787402V0.112402C0.843637 0.0974885 0.837706 0.0831897 0.827161 0.072644C0.816615 0.0620983 0.802316 0.0561672 0.787402 0.0561523ZM0.787402 0.309277H0.393652V0.112402H0.787402V0.309277ZM0.337402 0.112402V0.309277H0.112402V0.112402H0.337402ZM0.112402 0.787402V0.365527H0.787402L0.787459 0.787402H0.112402Z"
				/>
			</svg>
			Present and share
		</h2>
		<p class="mb-3 text-gray-600 dark:text-gray-300">
			Gradio can be embedded in <a
				href="https://colab.research.google.com/drive/1T70IHFbztf_F0-HggwvM1PN7jBmS_wPN"
				class="text-link">Python notebooks</a
			>
			or presented as a
			<a
				href="https://huggingface.co/spaces/akhaliq/AnimeGANv2"
				class="text-link">webpage</a
			>.
		</p>
		<p class="text-gray-600 dark:text-gray-300">
			A Gradio interface can automatically generate a public link you can share
			with colleagues that lets them interact with the model on your computer
			remotely from their own devices.
		</p>
	</div>
	<div
		class="shadow-alternate flex-1 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-neutral-900 p-6"
	>
		<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				aria-hidden="true"
				role="img"
				class="mr-2 mb-3 text-2xl text-gray-800 dark:text-gray-200"
				width="1em"
				height="1em"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 32 32"
			>
				<path
					fill="currentColor"
					d="M16 2a8 8 0 1 0 8 8a8.01 8.01 0 0 0-8-8zm5.91 7h-2.438a15.246 15.246 0 0 0-.791-4.36A6.009 6.009 0 0 1 21.91 9zm-5.888 6.999h-.008c-.38-.12-1.309-1.821-1.479-4.999h2.93c-.17 3.176-1.094 4.877-1.443 4.999zM14.535 9c.17-3.176 1.094-4.877 1.443-4.999h.008c.38.12 1.309 1.821 1.479 4.999zM13.32 4.64A15.246 15.246 0 0 0 12.528 9H10.09a6.009 6.009 0 0 1 3.23-4.36zM10.09 11h2.437a15.246 15.246 0 0 0 .792 4.36A6.009 6.009 0 0 1 10.09 11zm8.59 4.36a15.246 15.246 0 0 0 .792-4.36h2.438a6.009 6.009 0 0 1-3.23 4.36zM28 30H4a2.002 2.002 0 0 1-2-2v-6a2.002 2.002 0 0 1 2-2h24a2.002 2.002 0 0 1 2 2v6a2.002 2.002 0 0 1-2 2zM4 22v6h24v-6z"
				/>
				<circle cx="7" cy="25" r="1" class="fill-current text-orange-500" />
			</svg>
			Permanent hosting
		</h2>
		<p class="mb-3 text-gray-600 dark:text-gray-300">
			Once you've created an interface, you can permanently host it on Hugging
			Face.
		</p>
		<p class="text-gray-600 dark:text-gray-300">
			<a href="https://huggingface.co/spaces" class="text-link"
				>Hugging Face Spaces</a
			> will host the interface on its servers and provide you with a link you can
			share.
		</p>
	</div>
</div>
<div class="text-center">
	<h2 class="mb-2 inline-block bg-white dark:bg-gray-950 px-5 text-gray-400">
		Used by
	</h2>
	<div
		class="border-t border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-neutral-900 px-4 pt-24 pb-32"
		style="margin-top: -1.2rem;"
	>
		<div
			class="mx-auto grid container grid-cols-3 justify-items-center gap-x-3 gap-y-8 grayscale sm:gap-x-4 md:grid-cols-5"
		>
			{#each data.logos as logo}
				<img
					class:constrast-0={logo.contrast}
					class="logo h-4 sm:h-5"
					src={logo.img}
					alt={logo.description}
				/>
			{/each}
		</div>
	</div>
</div>
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
