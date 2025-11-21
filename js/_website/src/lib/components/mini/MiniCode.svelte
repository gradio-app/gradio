<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-code-container">
			<div class="gradio-code-gutter">
				<span class="gradio-code-line-number">1</span>
				<span class="gradio-code-line-number">2</span>
				<span class="gradio-code-line-number">3</span>
			</div>
			<div class="gradio-code-content">
				<div class="gradio-code-line">
					<span class="code-keyword">def</span>
					<span class="code-function">hello</span>():
				</div>
				<div class="gradio-code-line">
					<span class="code-keyword">print</span>(<span class="code-string"
						>"Hi"</span
					>)
				</div>
				<div class="gradio-code-line">
					<span class="code-keyword">return</span>
					<span class="code-number">42</span>
				</div>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/code"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Code
	</a>
</div>

<style>
	.gradio-code-container {
		display: flex;
		width: 100%;
		background-color: rgb(243 244 246);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		overflow: hidden;
		font-family: "IBM Plex Mono", ui-monospace, Consolas, monospace;
		font-size: 0.75rem;
		line-height: 1.25rem;
	}

	.gradio-code-gutter {
		display: flex;
		flex-direction: column;
		background-color: rgb(249 250 251);
		border-right: 1px solid rgb(229 231 235);
		padding: 0.25rem 0.5rem;
		color: rgb(156 163 175);
		text-align: right;
		user-select: none;
	}

	.gradio-code-line-number {
		display: block;
		line-height: 1.25rem;
	}

	.gradio-code-content {
		flex: 1;
		padding: 0.25rem 0.5rem;
		color: rgb(31 41 55);
	}

	.gradio-code-line {
		line-height: 1.25rem;
		white-space: nowrap;
	}

	.code-keyword {
		color: rgb(168 85 247);
		font-weight: 600;
	}

	.code-function {
		color: rgb(59 130 246);
	}

	.code-string {
		color: rgb(34 197 94);
	}

	.code-number {
		color: rgb(249 115 22);
	}

	:global(.dark) .gradio-code-container {
		background-color: rgb(23 23 23);
		border-color: rgb(64 64 64);
	}

	:global(.dark) .gradio-code-gutter {
		background-color: rgb(38 38 38);
		border-color: rgb(64 64 64);
		color: rgb(115 115 115);
	}

	:global(.dark) .gradio-code-content {
		color: rgb(229 231 235);
	}

	:global(.dark) .code-keyword {
		color: rgb(196 181 253);
	}

	:global(.dark) .code-function {
		color: rgb(147 197 253);
	}

	:global(.dark) .code-string {
		color: rgb(134 239 172);
	}

	:global(.dark) .code-number {
		color: rgb(251 146 60);
	}
</style>
