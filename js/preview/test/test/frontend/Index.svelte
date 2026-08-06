<script lang="ts">
	import "./main.css";
	import { JsonView } from "@zerodevx/svelte-json-view";

	import type { Gradio } from "@gradio/utils";
	import { Block, Info } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";
	import type { SelectData } from "@gradio/utils";

	let {
		elem_id = "",
		elem_classes = [],
		visible = true,
		value = false,
		container = true,
		scale = null,
		min_width = undefined,
		loading_status,
		gradio
	}: {
		elem_id?: string;
		elem_classes?: string[];
		visible?: boolean | "hidden";
		value?: boolean;
		container?: boolean;
		scale?: number | null;
		min_width?: number | undefined;
		loading_status: LoadingStatus;
		gradio: Gradio<{
			change: never;
			select: SelectData;
			input: never;
		}>;
	} = $props();
</script>

<div class="relative flex min-h-screen flex-col justify-center overflow-hidden">
	<div
		class="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10"
	>
		<div class="mx-auto max-w-md">
			<h1 class="text-xl! font-bold! text-gray-900">
				<span class="text-blue-500">Tailwind</span> in Gradio
			</h1>
			<h2><em>(i hope you're happy now)</em></h2>
			<div class="divide-y divide-gray-300/50">
				<div class="space-y-6 py-8 text-base leading-7 text-gray-600">
					<p>
						An advanced online playground for Tailwind CSS, including support
						for things like:
					</p>
					<ul class="space-y-4 my-4!">
						<li class="flex items-center">
							<svg
								class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2 mr-4"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="11" />
								<path
									d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
									fill="none"
								/>
							</svg>
							<p class="ml-4">
								Customizing your
								<code class="text-sm font-bold text-gray-900"
									>tailwind.config.js</code
								> file
							</p>
						</li>
						<li class="flex items-center">
							<svg
								class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2 mr-4"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="11" />
								<path
									d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
									fill="none"
								/>
							</svg>
							<p class="ml-4">
								Extracting classes with
								<code class="text-sm font-bold text-gray-900">@apply</code>
							</p>
						</li>
						<li class="flex items-center">
							<svg
								class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2 mr-4"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="11" />
								<path
									d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9"
									fill="none"
								/>
							</svg>
							<p class="ml-4">Code completion with instant preview</p>
						</li>
					</ul>
					<p>
						Perfect for learning how the framework works, prototyping a new
						idea, or creating a demo to share online.
					</p>
				</div>
				<div class="pt-8 text-base font-semibold leading-7">
					<p class="text-gray-900">Want to dig deeper into Tailwind?</p>
					<p>
						<a
							href="https://tailwindcss.com/docs"
							class="text-sky-500 hover:text-sky-600">Read the docs &rarr;</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
