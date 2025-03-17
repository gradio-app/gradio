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
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
		<path
			d="M12 12H19M16 8L19 12L16 16"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "add-column-left"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="16"
			y="6"
			width="4"
			height="12"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
		<path
			d="M12 12H5M8 8L5 12L8 16"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "add-row-above"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="6"
			y="16"
			width="12"
			height="4"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12V5M8 8L12 5L16 8"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "add-row-below"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="6"
			y="4"
			width="12"
			height="4"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M12 12V19M8 16L12 19L16 16"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "delete-row"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="5"
			y="10"
			width="14"
			height="4"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M8 7L16 17M16 7L8 17"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "delete-column"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<rect
			x="10"
			y="5"
			width="4"
			height="14"
			stroke="currentColor"
			stroke-width="2"
		/>
		<path
			d="M7 8L17 16M17 8L7 16"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "sort-asc"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<path
			d="M8 16L12 12L16 16"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M12 12V19"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M5 7H19"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "sort-desc"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<path
			d="M8 12L12 16L16 12"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M12 16V9"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M5 5H19"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
{:else if icon == "clear-sort"}
	<svg viewBox="0 0 24 24" width="16" height="16">
		<path
			d="M5 5H19"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M5 9H15"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M5 13H11"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M5 17H7"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M17 17L21 21M21 17L17 21"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
{/if}
