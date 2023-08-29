<script lang="ts">
	export let fns: any[];
</script>

<div id="event-listeners-description">
	<h4 class="mt-8 text-xl text-orange-500 font-light group">Description</h4>
	<p class="mb-2 text-lg text-gray-600">
		Event listeners allow you to capture and respond to user interactions with
		the UI components you've defined in a Gradio Blocks app. When a user
		interacts with an element, such as changing a slider value or uploading an
		image, a function is called.
	</p>
</div>

<div id="event-listeners-list">
	<h4
		class="text-xl text-orange-500 font-light group"
		id="supported-event-listeners"
	>
		Supported Event Listeners
	</h4>
	<p class="mb-4 text-lg text-gray-600">
		The <span class="font-mono">{fns[0].parent.replace("gradio.", "")}</span>
		component supports the following event listeners. Each event listener takes the
		same parameters, which are listed in the
		<a href="#event-listeners-arguments" class="text-orange-500 font-light"
			>Event Arguments</a
		> table below.
	</p>

	<table class="mb-4 table-fixed w-full">
		<thead class="text-left">
			<tr>
				<th class="px-3 pb-3 text-gray-700 font-semibold w-2/5">Listener</th>
				<th class="px-3 pb-3 text-gray-700 font-semibold">Description</th>
			</tr>
		</thead>
		<tbody
			class="text-left divide-y rounded-lg bg-gray-50 border border-gray-100 overflow-hidden"
		>
			{#each fns as fn}
				<tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80 align-top">
					<td class="p-3 w-2/5 break-words">
						<p>
							<code class="lang-python">{fn.parent}.{fn.name}(fn, ···)</code>
						</p>
					</td>
					<td class="p-3 break-words text-gray-700">
						<p>{fn.description}</p>
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
		Event Arguments
	</h4>

	<table class="table-fixed w-full leading-loose">
		<thead class="text-left">
			<tr>
				<th class="px-3 pb-3 font-semibold text-gray-700 w-2/5">Parameter</th>
				<th class="px-3 pb-3 font-semibold text-gray-700">Description</th>
			</tr>
		</thead>
		<tbody
			class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y"
		>
			{#each fns[0].parameters as param}
				{#if param["name"] != "self"}
					<tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
						<td class="p-3 w-2/5 break-words">
							<code class="block">
								{param["name"]}
							</code>
							<p class="text-gray-500 italic">{param["annotation"]}</p>
							{#if "default" in param}
								<p class="text-gray-500 font-semibold">
									default: {param["default"]}
								</p>
							{:else if !("kwargs" in param)}
								<p class="text-orange-600 font-semibold italic">required</p>
							{/if}
						</td>
						<td class="p-3 text-gray-700 break-words">
							<p>{param["doc"] || ""}</p>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	code {
		font-size: 0.9em;
	}
</style>
