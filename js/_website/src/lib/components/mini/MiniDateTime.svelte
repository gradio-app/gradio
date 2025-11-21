<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-4">
		<div class="gradio-datetime">
			<input type="text" class="datetime-input" value="2025-01-15" readonly />
			<button class="datetime-calendar-btn">
				<svg viewBox="0 0 16 16" fill="currentColor">
					<path
						d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
					/>
					<circle cx="4.5" cy="8.5" r=".5" />
					<circle cx="7.5" cy="8.5" r=".5" />
					<circle cx="10.5" cy="8.5" r=".5" />
				</svg>
			</button>
		</div>
	</div>
	<a
		href="/docs/gradio/datetime"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>DateTime</a
	>
</div>

<style>
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

	:global(.dark) .gradio-datetime {
		background: rgb(38 38 38);
	}

	:global(.dark) .datetime-input {
		background: rgb(38 38 38);
		border-color: rgb(64 64 64);
		color: rgb(229 231 235);
	}

	:global(.dark) .datetime-calendar-btn {
		background: rgb(38 38 38);
		border-color: rgb(64 64 64);
		color: rgb(156 163 175);
	}

	:global(.dark) .datetime-calendar-btn:hover {
		color: rgb(229 231 235);
	}
</style>
