<script lang="ts">
	import { output_component_map } from "../../directory";

	interface Component {
		name: string;
		[key: string]: unknown;
	}

	export let value: Array<Array<unknown>>;
	export let theme: string;
	export let components: Array<Component>;

	let carousel_index: number = 0;
	const next = () => {
		carousel_index = (carousel_index + 1) % value.length;
	};
	const prev = () => {
		carousel_index = (carousel_index - 1 + value.length) % value.length;
	};
</script>

<div class="output-carousel flex flex-col gap-2" {theme}>
	{#each components as component, i}
		<div class="component">
			{#if component.label}
				<div class="panel-header">{component.label}</div>
			{/if}
			<svelte:component
				this={output_component_map[component.name].component}
				{...component}
				{theme}
				value={value[carousel_index][i]}
			/>
		</div>
	{/each}
	<div class="carousel-control flex gap-4 justify-center items-center my-1">
		<button on:click={prev}>
			<svg
				class="caret h-3 mt-0.5 fill-current"
				viewBox="0 0 9.1457395 15.999842"
			>
				<path
					d="M 0.32506616,7.2360106 7.1796187,0.33129769 c 0.4360247,-0.439451 1.1455702,-0.442056 1.5845974,-0.0058 0.4390612,0.435849 0.441666,1.14535901 0.00582,1.58438501 l -6.064985,6.1096644 6.10968,6.0646309 c 0.4390618,0.436026 0.4416664,1.145465 0.00582,1.584526 -0.4358485,0.439239 -1.1453586,0.441843 -1.5845975,0.0058 L 0.33088256,8.8203249 C 0.11135166,8.6022941 0.00105996,8.3161928 7.554975e-6,8.0295489 -0.00104244,7.7427633 0.10735446,7.4556467 0.32524356,7.2361162"
				/>
			</svg>
		</button>
		<div
			class="carousel_index text-xl text-center font-semibold"
			style="min-width: 60px"
		>
			{carousel_index + 1} / {value.length}
		</div>
		<button on:click={next}>
			<svg
				class="caret h-3 mt-0.5 fill-current"
				viewBox="0 0 9.1457395 15.999842"
				transform="scale(-1, 1)"
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
