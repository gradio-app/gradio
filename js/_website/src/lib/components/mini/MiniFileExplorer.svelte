<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-fileexplorer">
			<div class="file-item folder-item">
				<span class="file-icon">📁</span>
				<span class="file-name">Documents</span>
			</div>
			<div class="file-item file-indent">
				<span class="file-icon">📄</span>
				<span class="file-name">file.txt</span>
			</div>
			<div class="file-item folder-item">
				<span class="file-icon">📁</span>
				<span class="file-name">Images</span>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/fileexplorer"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>FileExplorer</a
	>
</div>

<style>
	.gradio-fileexplorer {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
		font-size: 0.75rem;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.375rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.file-item:hover {
		background-color: rgb(243 244 246);
	}

	.file-indent {
		padding-left: 1.25rem;
	}

	.file-icon {
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.file-name {
		color: rgb(31 41 55);
		font-size: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.dark) .gradio-fileexplorer {
		background-color: rgb(23 23 23);
		border-color: rgb(64 64 64);
	}

	:global(.dark) .file-item:hover {
		background-color: rgb(38 38 38);
	}

	:global(.dark) .file-name {
		color: rgb(229 231 235);
	}
</style>
