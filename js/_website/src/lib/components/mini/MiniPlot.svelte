<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div
			class="w-full bg-white dark:bg-neutral-800 rounded border border-gray-300 dark:border-neutral-700 p-2"
		>
			<svg viewBox="0 0 140 100" class="w-full h-20">
				<line
					x1="15"
					y1="5"
					x2="15"
					y2="80"
					stroke="currentColor"
					stroke-width="1"
					opacity="0.3"
				/>
				<line
					x1="15"
					y1="80"
					x2="135"
					y2="80"
					stroke="currentColor"
					stroke-width="1"
					opacity="0.3"
				/>
				<line
					x1="15"
					y1="20"
					x2="135"
					y2="20"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.1"
				/>
				<line
					x1="15"
					y1="40"
					x2="135"
					y2="40"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.1"
				/>
				<line
					x1="15"
					y1="60"
					x2="135"
					y2="60"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.1"
				/>

				<defs>
					<linearGradient id="plot-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop
							offset="0%"
							style="stop-color:rgb(249 115 22);stop-opacity:0.3"
						/>
						<stop
							offset="100%"
							style="stop-color:rgb(249 115 22);stop-opacity:0"
						/>
					</linearGradient>
				</defs>

				<polygon
					points="20,65 35,50 55,58 75,35 95,40 115,25 115,80 20,80"
					fill="url(#plot-gradient)"
				/>
				<polyline
					points="20,65 35,50 55,58 75,35 95,40 115,25"
					fill="none"
					stroke="rgb(249 115 22)"
					stroke-width="2"
				/>

				{#each [[20, 65], [35, 50], [55, 58], [75, 35], [95, 40], [115, 25]] as [x, y]}
					<circle cx={x} cy={y} r="2" fill="rgb(249 115 22)" />
				{/each}

				<line
					x1="15"
					y1="80"
					x2="15"
					y2="82"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.3"
				/>
				<line
					x1="55"
					y1="80"
					x2="55"
					y2="82"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.3"
				/>
				<line
					x1="95"
					y1="80"
					x2="95"
					y2="82"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.3"
				/>
				<line
					x1="135"
					y1="80"
					x2="135"
					y2="82"
					stroke="currentColor"
					stroke-width="0.5"
					opacity="0.3"
				/>

				<!-- Axis labels -->
				<text
					x="15"
					y="92"
					font-size="6"
					fill="currentColor"
					opacity="0.5"
					text-anchor="middle">0</text
				>
				<text
					x="55"
					y="92"
					font-size="6"
					fill="currentColor"
					opacity="0.5"
					text-anchor="middle">5</text
				>
				<text
					x="95"
					y="92"
					font-size="6"
					fill="currentColor"
					opacity="0.5"
					text-anchor="middle">10</text
				>
				<text
					x="135"
					y="92"
					font-size="6"
					fill="currentColor"
					opacity="0.5"
					text-anchor="middle">15</text
				>
			</svg>
		</div>
	</div>
	<a
		href="/docs/gradio/plot"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Plot
	</a>
</div>
