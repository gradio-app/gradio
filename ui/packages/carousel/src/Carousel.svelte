<script context="module">
	export const CAROUSEL = {};
</script>

<script lang="ts">
	import { setContext, createEventDispatcher } from "svelte";
	import { writable } from "svelte/store";

	export let style: string = "";

	const dispatch = createEventDispatcher<{
		change: undefined;
	}>();
	const items = writable<Array<number>>([]);
	const current = writable<number>();

	let id = -1;

	setContext(CAROUSEL, {
		register: () => {
			$items.push(++id);
			$items = $items;
			return id;
		},
		unregister: (id: number) => {
			const i = $items.findIndex((_id) => _id === id);
			$items.slice(i, 1);

			$items = $items;
		},
		current
	});

	let carousel_index: number = 0;
	$: $current = $items[carousel_index] || 0;

	const next = () => {
		carousel_index = (carousel_index + 1) % $items.length;
		dispatch("change");
	};

	const prev = () => {
		carousel_index = (carousel_index - 1 + $items.length) % $items.length;
		dispatch("change");
	};
</script>

<div class="output-carousel flex flex-col relative" {style}>
	<slot />

	<div
		class="carousel-control flex gap-4 justify-center items-center pt-2 text-sm"
	>
		<button
			on:click={prev}
			class="flex items-center justify-center h-6 w-6 hover:text-orange-500"
		>
			<svg
				class="caret text-xs fill-current"
				width=".7em"
				height=".7em"
				viewBox="0 0 9.1457395 15.999842"
			>
				<path
					d="M 0.32506616,7.2360106 7.1796187,0.33129769 c 0.4360247,-0.439451 1.1455702,-0.442056 1.5845974,-0.0058 0.4390612,0.435849 0.441666,1.14535901 0.00582,1.58438501 l -6.064985,6.1096644 6.10968,6.0646309 c 0.4390618,0.436026 0.4416664,1.145465 0.00582,1.584526 -0.4358485,0.439239 -1.1453586,0.441843 -1.5845975,0.0058 L 0.33088256,8.8203249 C 0.11135166,8.6022941 0.00105996,8.3161928 7.554975e-6,8.0295489 -0.00104244,7.7427633 0.10735446,7.4556467 0.32524356,7.2361162"
				/>
			</svg>
		</button>
		<div class="carousel_index text-center font-semibold">
			{carousel_index + 1} / {$items.length}
		</div>
		<button
			on:click={next}
			class="flex items-center justify-center h-6 w-6  hover:text-orange-500"
		>
			<svg
				class="caret text-xs fill-current scale-x-[-1]"
				width=".7em"
				height=".7em"
				viewBox="0 0 9.1457395 15.999842"
			>
				<path
					d="M 0.32506616,7.2360106 7.1796187,0.33129769 c 0.4360247,-0.439451 1.1455702,-0.442056 1.5845974,-0.0058 0.4390612,0.435849 0.441666,1.14535901 0.00582,1.58438501 l -6.064985,6.1096644 6.10968,6.0646309 c 0.4390618,0.436026 0.4416664,1.145465 0.00582,1.584526 -0.4358485,0.439239 -1.1453586,0.441843 -1.5845975,0.0058 L 0.33088256,8.8203249 C 0.11135166,8.6022941 0.00105996,8.3161928 7.554975e-6,8.0295489 -0.00104244,7.7427633 0.10735446,7.4556467 0.32524356,7.2361162"
				/>
			</svg>
		</button>
	</div>
</div>

<style lang="postcss">
</style>
