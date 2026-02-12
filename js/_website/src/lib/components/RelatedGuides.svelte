<script lang="ts">
	export let related_guides: { name: string; url: string }[];
</script>

<div class="mt-4">
	<h2
		class="text-sm tracking-wider font-semibold text-gray-600 dark:text-gray-300 py-2 block"
	>
		Related Guides
	</h2>

	<ul class="space-y-2 list-none">
		{#each related_guides as guide}
			<li>
				<a
					href={`/guides/${guide.url}`}
					target="_blank"
					rel="noopener noreferrer"
					class="related-guide-link group flex items-center justify-between overflow-hidden rounded-xl px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 my-2"
				>
					<span
						class="block text-xs transition-colors py-1 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0"
					>
						{guide.name}
					</span>
					<span class="flex-shrink-0 flex items-center">
						<svg
							class="ml-2"
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#f97316"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<!-- <path d="M7 17L17 7" /> -->
							<!-- <path d="M7 7h10v10" /> -->
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.related-guide-link svg {
		transition: transform 0.15s ease;
	}

	.related-guide-link:hover svg {
		transform: rotate(-45deg);
	}
</style>
