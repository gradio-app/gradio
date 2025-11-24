<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-4">
		<div class="gradio-dropdown" style="pointer-events: none;">
			<div class="dropdown-display">Option A</div>
			<div class="dropdown-arrow-icon">
				<svg viewBox="0 0 12 12" fill="none" stroke="currentColor">
					<path
						d="M3 5 L6 8 L9 5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/dropdown"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Dropdown</a
	>
</div>

<style>
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

	:global(.dark) .gradio-dropdown {
		background: rgb(38 38 38);
		border-color: rgb(82 82 82);
	}

	:global(.dark) .dropdown-display {
		color: rgb(229 231 235);
	}

	:global(.dark) .dropdown-arrow-icon {
		color: rgb(229 231 235);
	}
</style>
