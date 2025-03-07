<script lang="ts">
	export let index: number | null = null;
	export let is_header = false;
</script>

{#if is_header}
	<th tabindex="-1" class="row-number">
		<div class="cell-wrap">
			<div class="header-content">
				<div class="header-text"></div>
			</div>
		</div>
	</th>
{:else}
	<td class="row-number" tabindex="-1" data-row={index} data-col="row-number">
		{index !== null ? index + 1 : ""}
	</td>
{/if}

<style>
	.row-number {
		text-align: center;
		padding: var(--size-1);
		min-width: var(--size-12);
		width: var(--size-12);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: var(--weight-semibold);
		background: var(--table-even-background-fill);
		border-right: 1px solid var(--border-color-primary);
	}

	:global(tr:nth-child(odd)) .row-number {
		background: var(--table-odd-background-fill);
	}

	:global(tr:nth-child(even)) .row-number {
		background: var(--table-even-background-fill);
	}
</style>
