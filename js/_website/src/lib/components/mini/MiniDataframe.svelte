<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<div
			class="w-full bg-white dark:bg-neutral-800 rounded border border-gray-300 dark:border-neutral-700 overflow-hidden"
		>
			<div class="mini-dataframe">
				<div class="dataframe-header">
					<div class="dataframe-cell header-cell">ID</div>
					<div class="dataframe-cell header-cell">Name</div>
					<div class="dataframe-cell header-cell">Value</div>
				</div>
				{#each [1, 2, 3] as row}
					<div class="dataframe-row">
						<div class="dataframe-cell">{row}</div>
						<div class="dataframe-cell">Item {row}</div>
						<div class="dataframe-cell">{row * 10}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<a
		href="/docs/dataframe"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Dataframe
	</a>
</div>
