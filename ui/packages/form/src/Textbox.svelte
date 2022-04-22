<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle, Block } from "@gradio/atoms";

	export let value: string = "";
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let style: string = "";
	export let disabled = false;
	export let autoheight: boolean = false;
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	const dispatch =
		createEventDispatcher<{ change: string; submit: undefined }>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();

		if (e.key === "Enter" && lines === 1) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	$: handle_change(value);

	async function resize(event: Event | { target: HTMLTextAreaElement }) {
		await tick();

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";
		target.style.height = +target.scrollHeight + "px";
	}

	function text_area_resize(
		el: HTMLTextAreaElement,
		{ enabled, value }: { enabled: boolean; value: string }
	) {
		if (!enabled) return;

		el.style.overflow = "hidden";
		el.addEventListener("input", resize);

		if (!value.trim()) return;
		resize({ target: el });

		return {
			destroy: () => el.removeEventListener("input", resize),
			update: () => resize({ target: el })
		};
	}
</script>

<Block {form_position}>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="block">
		<BlockTitle>{label}</BlockTitle>

		{#if autoheight || lines > 1}
			<textarea
				use:text_area_resize={{ enabled: autoheight, value }}
				class="block gr-box gr-input w-full gr-text-input"
				bind:value
				{placeholder}
				{style}
				rows={lines}
				{disabled}
			/>
		{:else}
			<input
				type="text"
				class="gr-box gr-input w-full gr-text-input"
				{placeholder}
				bind:value
				on:keypress={handle_keypress}
				{style}
				{disabled}
			/>
		{/if}
	</label>
</Block>
