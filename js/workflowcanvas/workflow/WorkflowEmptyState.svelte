<div class="empty-state">
	<div class="empty-icon">✦</div>
	<div class="empty-title">Start building</div>
	<div class="empty-hint">Add a model or space from the toolbar below</div>
</div>

<style>
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		pointer-events: none;
	}

	.empty-icon {
		font-size: 22px;
		color: #2a2b36;
		margin-bottom: 4px;
	}

	.empty-title {
		font-size: 15px;
		font-weight: 700;
		color: #3e3f4d;
		letter-spacing: -0.01em;
	}

	.empty-hint {
		font-size: 11.5px;
		color: #2a2b36;
	}
</style>
