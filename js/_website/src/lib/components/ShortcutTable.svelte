<script lang="ts">
	export let shortcuts = [] as any[];
</script>

<table class="mb-4 table-fixed w-full">
	<thead class="text-left">
		<tr>
			<th class="px-3 pb-3 text-gray-700 font-semibold w-2/5">Class</th>
			<th class="px-3 pb-3 text-gray-700 font-semibold"
				>Interface String Shortcut</th
			>
			<th class="px-3 pb-3 text-gray-700 font-semibold">Initialization</th>
		</tr>
	</thead>
	<tbody
		class="text-left divide-y rounded-lg bg-gray-50 border border-gray-100 overflow-hidden"
	>
		{#each shortcuts as shortcut}
			<tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
				<td class="p-3 w-2/5 break-words">
					<p>
						<code class="lang-python">gradio.{shortcut[0]}</code>
					</p>
				</td>
				<td class="p-3 w-2/5 break-words">
					<p>"{shortcut[1]}"</p>
				</td>
				<td class="p-3 text-gray-700 break-words">
					{shortcut[2]}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
