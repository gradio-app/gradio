<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;
	export let min_height = false;
	import { afterUpdate } from "svelte";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	let target: HTMLElement;
	let katex: Module | undefined;
	afterUpdate(async () => {
		let latex_elements = target.querySelectorAll(".math");
		if (latex_elements.length === 0) {
			return;
		}

		if (katex === undefined) {
			katex = await import("./katex");
		}
		katex.render(latex_elements);
	});

	$: value, dispatch("change");
</script>

<div
	id={elem_id}
	class:min-h-[6rem]={min_height}
	class="output-markdown gr-prose"
	class:hidden={!visible}
	style="max-width: 100%"
	bind:this={target}
>
	{@html value}
</div>
