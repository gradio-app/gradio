<script lang="ts">
	export let icon: string;
</script>

{#if icon == "add-column-right"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="4"
			y="6"
			width="4"
			height="12"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12H20M16 8l4 4-4 4"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{:else if icon == "add-column-left"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="16"
			y="6"
			width="4"
			height="12"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12H4M8 8l-4 4 4 4"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{:else if icon == "add-row-above"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="6"
			y="16"
			width="12"
			height="4"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12V4M8 8l4-4 4 4"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{:else if icon == "add-row-below"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="6"
			y="4"
			width="12"
			height="4"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12V20M8 16l4 4 4-4"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{:else if icon == "delete-row"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="5"
			y="10"
			width="14"
			height="4"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M9 7L15 17M15 7L9 17"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{:else if icon == "delete-column"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="10"
			y="5"
			width="4"
			height="14"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M7 9L17 15M17 9L7 15"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
{/if}
