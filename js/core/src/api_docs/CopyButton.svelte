<script lang="ts">
	import IconCopy from "./img/IconCopy.svelte";
	import IconCheck from "./img/IconCheck.svelte";

	export let code: string;

	let copied = false;

	function copy(): void {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1500);
	}

	$: copied;
</script>

<button on:click={copy} class="copy-button" aria-live="polite">
	<span
		class="inline-flex items-center justify-center rounded-md p-0.5 max-sm:p-0"
	>
		{#if copied}
			<IconCheck classNames="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5" />
		{:else}
			<IconCopy classNames="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5" />
		{/if}
	</span>
</button>

<style>
	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 24px;
		padding-left: 8px;
		padding-right: 8px;
		font-size: 11px;
		font-weight: 500;
		color: rgb(31, 41, 55);
		border: 1px solid rgb(229, 231, 235);
		border-radius: 6px;
		background-color: white;

		@media (max-width: 640px) {
			gap: 2px;
			height: 20px;
			padding-left: 6px;
			padding-right: 6px;
			font-size: 9px;
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}

		&:hover {
			box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
		}

		@media (prefers-color-scheme: dark) {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);

			&:hover {
				background-color: rgb(38, 38, 38);
			}
		}
	}
</style>
