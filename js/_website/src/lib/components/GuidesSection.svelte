<script lang="ts">
	export let guides = [] as any[];
	const COLOR_SETS = [
		["from-green-100", "to-green-50"],
		["from-yellow-100", "to-yellow-50"],
		["from-red-100", "to-red-50"],
		["from-blue-100", "to-blue-50"],
		["from-pink-100", "to-pink-50"],
		["from-purple-100", "to-purple-50"]
	];
</script>

{#if guides && guides.length > 0}
	<div class="guides-list grid grid-cols-1 lg:grid-cols-4 gap-4 pb-3 pt-2">
		{#each guides as guide, i}
			<a
				class="guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {COLOR_SETS[
					i
				][0]} {COLOR_SETS[i][1]}"
				target="_blank"
				href="../..{guide.url}"
			>
				<div class="flex flex-col p-4 h-min">
					<p class="group-hover:underline text-l">
						{guide.pretty_name}
					</p>
				</div>
			</a>
		{/each}
	</div>
{/if}
