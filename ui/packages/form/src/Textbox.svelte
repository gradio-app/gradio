<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string = "";
	export let lines: number = 1;
	export let placeholder: string = "Type here...";
	export let label: string;
	export let info: string | null = null;
	export let disabled = false;
	export let show_label: boolean = true;
	export let max_lines: number | false;
	export let type: "text" | "password" | "email" = "text";

	let el: HTMLTextAreaElement | HTMLInputElement;

	$: value, el && lines !== max_lines && resize({ target: el });
	$: handle_change(value);

	const dispatch = createEventDispatcher<{
		change: string;
		submit: undefined;
		blur: undefined;
	}>();

	function handle_change(val: string) {
		dispatch("change", val);
	}

	function handle_blur(e: FocusEvent) {
		dispatch("blur");
	}

	async function handle_keypress(e: KeyboardEvent) {
		await tick();
		if (e.key === "Enter" && e.shiftKey && lines > 1) {
			e.preventDefault();
			dispatch("submit");
		} else if (
			e.key === "Enter" &&
			!e.shiftKey &&
			lines === 1 &&
			max_lines >= 1
		) {
			e.preventDefault();
			dispatch("submit");
		}
	}

	async function resize(
		event: Event | { target: HTMLTextAreaElement | HTMLInputElement }
	) {
		await tick();
		if (lines === max_lines) return;

		let max =
			max_lines === false
				? false
				: max_lines === undefined // default
				? 21 * 11
				: 21 * (max_lines + 1);
		let min = 21 * (lines + 1);

		const target = event.target as HTMLTextAreaElement;
		target.style.height = "1px";

		let scroll_height;
		if (max && target.scrollHeight > max) {
			scroll_height = max;
		} else if (target.scrollHeight < min) {
			scroll_height = min;
		} else {
			scroll_height = target.scrollHeight;
		}

		target.style.height = `${scroll_height}px`;
	}

	function text_area_resize(el: HTMLTextAreaElement, value: string) {
		if (lines === max_lines) return;
		el.style.overflowY = "scroll";
		el.addEventListener("input", resize);

		if (!value.trim()) return;
		resize({ target: el });

		return {
			destroy: () => el.removeEventListener("input", resize)
		};
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	{#if lines === 1 && max_lines === 1}
		{#if type === "text"}
			<input
				data-testid="textbox"
				type="text"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
			/>
		{:else if type === "password"}
			<input
				data-testid="password"
				type="password"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				autocomplete=""
			/>
		{:else if type === "email"}
			<input
				data-testid="textbox"
				type="email"
				class="scroll-hide"
				bind:value
				bind:this={el}
				{placeholder}
				{disabled}
				on:keypress={handle_keypress}
				on:blur={handle_blur}
				autocomplete="email"
			/>
		{/if}
	{:else}
		<textarea
			data-testid="textbox"
			use:text_area_resize={value}
			class="scroll-hide"
			bind:value
			bind:this={el}
			{placeholder}
			rows={lines}
			{disabled}
			on:keypress={handle_keypress}
			on:blur={handle_blur}
		/>
	{/if}
</label>

<style>
	label {
		display: block;
		width: 100%;
	}

	input[type="text"],
	input[type="password"],
	input[type="email"],
	textarea {
		--ring-color: transparent;
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: 0 0 0 var(--shadow-spread) var(--ring-color),
			var(--shadow-inset);
		border: 1px solid var(--input-border-color-base);
		border-radius: var(--radius-lg);
		background: var(--input-background-base);
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	input:focus,
	textarea:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--color-text-placeholder);
	}

	input[disabled],
	textarea[disabled] {
		box-shadow: none;
	}
</style>
