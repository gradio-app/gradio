<script lang="ts">
	import type { ComponentMeta, Dependency } from "./components/types";

	export let components: Array<ComponentMeta>;
	export let dependencies: Array<Dependency>;
	export let root: string;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	let just_copied = -1;
</script>

<div>
	{#if dependencies.some((d) => "documentation" in d)}
		<h2 class="text-3xl text-center mb-6">
			API Docs for
			<span class="italic text-amber-500">
				{root}
			</span>
		</h2>
		<div class="flex flex-col gap-6">
			{#each dependencies as dependency, d}
				{#if dependency.documentation}
					<div
						class="bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6 rounded"
					>
						<h3 class="text-3xl text-amber-500 font-semibold mb-2">
							POST /api/{dependency.api_name}
						</h3>
						<div class="mb-6">
							Full URL: <span class="underline"
								>{root}api/{dependency.api_name}</span
							>
							<button
								class="ml-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
								on:click={() => {
									navigator.clipboard.writeText(
										root + "api/" + dependency.api_name
									);
									just_copied = d;
									setTimeout(() => {
										just_copied = -1;
									}, 500);
								}}
							>
								{#if just_copied === d}copied!{:else}copy{/if}
							</button>
						</div>
						<h4 class="text-2xl mt-6 mb-4">Input Payload</h4>
						<div
							class="block mb-4 text-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono"
						>
							&#123;<br />
							&nbsp;&nbsp;"data": [<br />
							{#each dependency.documentation[0] as dependency_doc, i}
								&nbsp;&nbsp;&nbsp;&nbsp;{dependency_doc[1]},
								<span class="text-pink-400 dark:text-pink-600"
									>// represents {dependency_doc[0]} of
									{((label) => {
										return label ? "'" + label + "'" : "the";
									})(
										components.filter((c) => c.id === dependency.inputs[i])[0]
											.props.label
									)}

									<span class="capitalize"
										>{components.filter((c) => c.id === dependency.inputs[i])[0]
											.props.name}</span
									> component
								</span>
								<br />
							{/each}
							&nbsp;&nbsp;]<br />
							&#125;
						</div>
						<h4 class="text-2xl mt-6 mb-4">Response Object</h4>
						<div
							class="block mb-4 text-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono"
						>
							&#123;<br />
							&nbsp;&nbsp;"data": [<br />
							{#each dependency.documentation[1] as dependency_doc, i}
								&nbsp;&nbsp;&nbsp;&nbsp;{dependency_doc[1]},
								<span class="text-pink-400 dark:text-pink-600"
									>// represents {dependency_doc[0]} of
									{((label) => {
										return label ? "'" + label + "'" : "the";
									})(
										components.filter((c) => c.id === dependency.outputs[i])[0]
											.props.label
									)}
									<span class="capitalize"
										>{components.filter(
											(c) => c.id === dependency.outputs[i]
										)[0].props.name}</span
									> component
								</span>
								<br />
							{/each}
							&nbsp;&nbsp;],<br />
							&nbsp;&nbsp;"duration": (float)
							<span class="text-pink-400 dark:text-pink-600">
								// number of seconds to run function call</span
							><br />
							&#125;
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<h2 class="text-3xl text-center mb-6">
			There are no named API Routes for
			<span class="italic text-amber-500">
				{root}
			</span>
		</h2>
		<div>
			To expose an api endpoint of your app in the documentation, set the <span
				class="italic text-amber-500"
			>
				api_name
			</span>
			parameter of the event listener. For more information, see the event
			listeners available for each component in the
			<a href="https://gradio.app/docs/#components" class="text-amber-500">
				documentation</a
			>.
		</div>
	{/if}
</div>
