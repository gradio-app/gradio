<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<div
			class="w-full bg-white dark:bg-neutral-800 rounded border border-gray-300 dark:border-neutral-700 overflow-hidden"
		>
			<div
				class="grid grid-cols-3 bg-gray-100 dark:bg-neutral-900 border-b border-gray-300 dark:border-neutral-700"
			>
				<div
					class="px-1 py-0.5 text-[8px] font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-neutral-700"
				>
					A
				</div>
				<div
					class="px-1 py-0.5 text-[8px] font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-neutral-700"
				>
					B
				</div>
				<div
					class="px-1 py-0.5 text-[8px] font-semibold text-gray-700 dark:text-gray-300"
				>
					C
				</div>
			</div>
			{#each Array(4) as _}
				<div
					class="grid grid-cols-3 border-b border-gray-200 dark:border-neutral-700 last:border-b-0"
				>
					<div
						class="px-1 py-0.5 text-[8px] text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-neutral-700"
					>
						···
					</div>
					<div
						class="px-1 py-0.5 text-[8px] text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-neutral-700"
					>
						···
					</div>
					<div class="px-1 py-0.5 text-[8px] text-gray-600 dark:text-gray-400">
						···
					</div>
				</div>
			{/each}
		</div>
	</div>
	<a
		href="/docs/gradio/dataframe"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Dataframe
	</a>
</div>
