<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-audio">
			<div class="audio-controls">
				<button class="audio-play-btn">▶</button>
				<div class="audio-waveform">
					<div class="waveform-bar" style="height: 40%"></div>
					<div class="waveform-bar" style="height: 70%"></div>
					<div class="waveform-bar" style="height: 50%"></div>
					<div class="waveform-bar" style="height: 90%"></div>
					<div class="waveform-bar" style="height: 60%"></div>
					<div class="waveform-bar" style="height: 80%"></div>
					<div class="waveform-bar" style="height: 45%"></div>
					<div class="waveform-bar" style="height: 65%"></div>
					<div class="waveform-bar" style="height: 55%"></div>
					<div class="waveform-bar" style="height: 75%"></div>
					<div class="waveform-bar" style="height: 35%"></div>
					<div class="waveform-bar" style="height: 85%"></div>
					<div class="waveform-bar" style="height: 50%"></div>
					<div class="waveform-bar" style="height: 70%"></div>
					<div class="waveform-bar" style="height: 40%"></div>
				</div>
				<span class="audio-time">0:15</span>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/audio"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Audio</a
	>
</div>

<style>
	.gradio-audio {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	.audio-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.audio-play-btn {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(249 115 22);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.625rem;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.audio-play-btn:hover {
		background-color: rgb(234 88 12);
	}

	.audio-waveform {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 1.5rem;
	}

	.waveform-bar {
		background: rgb(249 115 22);
		border-radius: 0.125rem;
		width: 1px;
	}

	.audio-time {
		color: rgb(107 114 128);
		font-size: 0.625rem;
		font-family: ui-monospace, monospace;
		flex-shrink: 0;
	}

	:global(.dark) .gradio-audio {
		background-color: rgb(23 23 23);
		border-color: rgb(64 64 64);
	}

	:global(.dark) .audio-time {
		color: rgb(156 163 175);
	}
</style>
