<script lang="ts">
	interface Component {
		id: number;
		props: {
			name: string;
            label?: string;
		};
	}
	interface Dependency {
		inputs: Array<number>;
		outputs: Array<number>;
		api_name: string | null;
		documentation?: Array<Array<string | null>>;
	}
	export let components: Array<Component>;
	export let dependencies: Array<Dependency>;

    let just_copied = false;
</script>

<div>
	<h2 class="text-3xl text-center mb-6">
		API Docs for
		<span class="italic text-amber-500">
			{window.location.href}
		</span>
	</h2>
	<div class="flex flex-col gap-6">
		{#each dependencies as dependency}
			{#if dependency.documentation}
				<div
					class="bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6 rounded"
				>
					<h3 class="text-3xl text-amber-500 font-semibold mb-2">
						/api/{dependency.api_name}
					</h3>
					<div class="mb-6">
						Full URL: <span class="underline"
							>{window.location.href}api/{dependency.api_name}</span
						>
                        <button class="ml-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
                            on:click={() => {
                                navigator.clipboard.writeText(window.location.href + "api/" + dependency.api_name);
                                just_copied = true;
                                setTimeout(() => {just_copied = false}, 500);
                            }}
                        >
                            {#if just_copied}copied!{:else}copy{/if}
                        </button>
					</div>
					<h4 class="text-2xl mt-6 mb-4">Input Payload</h4>
					<div
						class="block mb-4 text-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono"
					>
						&#123;<br />
						&nbsp;&nbsp;"data": [<br />
						{#each dependency.documentation[0] as dependency_doc, i}
							&nbsp;&nbsp;&nbsp;&nbsp;{dependency_doc?.substring(
								0,
								dependency_doc.indexOf(")") + 1
							)},
							<span class="text-pink-400 dark:text-pink-600"
								>// represents {dependency_doc?.substring(
									dependency_doc.indexOf(": ") + 2
								)} of
                                {"'" + components.filter((c) => c.id === dependency.inputs[i])[0]
                                    .props.label + "'" || "the"}
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
							&nbsp;&nbsp;&nbsp;&nbsp;{dependency_doc?.substring(
								0,
								dependency_doc.indexOf(")") + 1
							)},
							<span class="text-pink-400 dark:text-pink-600"
								>// represents {dependency_doc?.substring(
									dependency_doc.indexOf(": ") + 2
								)} of
                                {"'" + components.filter((c) => c.id === dependency.outputs[i])[0]
                                .props.label + "'" || "the"}

								<span class="capitalize"
									>{components.filter((c) => c.id === dependency.outputs[i])[0]
										.props.name}</span
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
</div>
