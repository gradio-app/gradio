<script lang="ts">
	export let fns: any[];
	import { style_formatted_text } from "$lib/text";
	import ParamTable from "$lib/components/ParamTable.svelte";
</script>

<div id="event-listeners-description">
	<h4 class="mt-8 text-xl text-orange-500 font-light group">Description</h4>
	<p class="mb-2 text-lg text-gray-600 dark:text-gray-300">
		Event listeners allow you to respond to user interactions with the UI
		components you've defined in a Gradio Blocks app. When a user interacts with
		an element, such as changing a slider value or uploading an image, a
		function is called.
	</p>
</div>

<div id="event-listeners-list">
	<h4
		class="text-xl text-orange-500 font-light group"
		id="supported-event-listeners"
	>
		Supported Event Listeners
	</h4>
	<p class="mb-4 text-lg text-gray-600 dark:text-gray-300">
		The <span class="font-mono">{fns[0].parent.replace("gradio.", "")}</span>
		component supports the following event listeners. Each event listener takes the
		same parameters, which are listed in the
		<a href="#event-listeners-arguments" class="text-orange-500 font-light"
			>Event Parameters</a
		> table below.
	</p>

	<table class="mb-4 table-fixed w-full event-table">
		<thead class="text-left">
			<tr>
				<th class="px-3 pb-3 font-semibold w-2/5">Listener</th>
				<th class="px-3 pb-3 font-semibold">Description</th>
			</tr>
		</thead>
		<tbody class="text-left rounded-lg overflow-hidden">
			{#each fns as fn}
				<tr class="group align-top">
					<td class="p-3 w-2/5 break-words">
						<p>
							<code class="lang-python"
								>{fn.parent.replace("gradio.", "")}.{fn.name}(fn, ···)</code
							>
						</p>
					</td>
					<td class="p-3 break-words">
						<p>{@html style_formatted_text(fn.description)}</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div id="event-listeners-arguments">
	<h4
		class="text-xl text-orange-500 font-light group"
		id="event-listener-arguments"
	>
		Event Parameters
	</h4>
	<ParamTable parameters={fns[0].parameters} anchor_links={"event"}
	></ParamTable>
</div>

<style>
	code {
		font-size: 0.9em;
	}

	.event-table thead th {
		color: var(--body-text-color);
	}

	.event-table tbody {
		border: 1px solid var(--table-border-color);
	}

	.event-table tbody tr {
		border-bottom: 1px solid var(--table-border-color);
	}

	.event-table tbody tr:last-child {
		border-bottom: none;
	}

	.event-table tbody tr:nth-child(odd) {
		background: var(--table-odd-background-fill);
	}

	.event-table tbody tr:nth-child(even) {
		background: var(--table-even-background-fill);
	}

	.event-table tbody tr:hover {
		background: var(--table-row-focus);
	}

	.event-table tbody td {
		color: var(--body-text-color);
	}
</style>
