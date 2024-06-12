<script lang="ts">
	export let parameters = [] as any[];
	import { style_formatted_text } from "$lib/text";
</script>

{#if (parameters.length > 0 && parameters[0].name != "self") || parameters.length > 1}
	<table class="table-fixed w-full leading-loose">
		<thead class="text-left">
			<tr>
				<th class="px-3 pb-3 w-2/5 text-gray-700 font-semibold">Parameter</th>
				<th class="px-3 pb-3 text-gray-700 font-semibold">Description</th>
			</tr>
		</thead>
		<tbody
			class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y"
		>
			{#each parameters as param}
				{#if param["name"] != "self"}
					<tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
						<td class="p-3 w-2/5 break-words">
							<code class="block">
								{param["name"]}
							</code>
							<p class="text-gray-500 italic">
								{param["annotation"].replace("Sequence[", "list[")}
							</p>
							{#if "default" in param}
								<p class="text-gray-500 font-semibold">
									default: {param["default"]}
								</p>
							{:else if !("kwargs" in param)}
								<p class="text-orange-600 font-semibold italic">required</p>
							{/if}
						</td>
						<td class="p-3 text-gray-700 break-words">
							<p>{@html style_formatted_text(param["doc"]) || ""}</p>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
{/if}
