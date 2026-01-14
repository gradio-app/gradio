<script lang="ts">
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty, IconButtonWrapper, IconButton } from "@gradio/atoms";
	import JSONNode from "./JSONNode.svelte";
	import { Copy, Check } from "@gradio/icons";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	let {
		value = {},
		open = false,
		theme_mode = "system" as "system" | "light" | "dark",
		show_indices = false,
		label_height,
		interactive = true,
		show_copy_button = true,
		buttons = null,
		on_custom_button_click = null
	}: {
		value?: any;
		open?: boolean;
		theme_mode?: "system" | "light" | "dark";
		show_indices?: boolean;
		label_height: number;
		interactive?: boolean;
		show_copy_button?: boolean;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
	} = $props();

	let json_max_height = $derived(`calc(100% - ${label_height}px)`);

	let copied = $state(false);
	let timer = $state<NodeJS.Timeout>();

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
			copy_feedback();
		}
	}

	function is_empty(obj: object): boolean {
		return (
			obj &&
			Object.keys(obj).length === 0 &&
			Object.getPrototypeOf(obj) === Object.prototype &&
			JSON.stringify(obj) === JSON.stringify({})
		);
	}

	$effect(() => {
		return () => {
			if (timer) clearTimeout(timer);
		};
	});
</script>

{#if value && value !== '""' && !is_empty(value)}
	{#if show_copy_button || (buttons && buttons.some((btn) => typeof btn !== "string"))}
		<IconButtonWrapper {buttons} {on_custom_button_click}>
			{#if show_copy_button}
				<IconButton
					show_label={false}
					label={copied ? "Copied" : "Copy"}
					Icon={copied ? Check : Copy}
					on:click={() => handle_copy()}
				/>
			{/if}
		</IconButtonWrapper>
	{/if}
	<div class="json-holder" style:max-height={json_max_height}>
		<JSONNode
			{value}
			depth={0}
			is_root={true}
			{open}
			{theme_mode}
			{show_indices}
			{interactive}
		/>
	</div>
{:else}
	<div class="empty-wrapper">
		<Empty>
			<JSONIcon />
		</Empty>
	</div>
{/if}

<style>
	:global(.copied svg) {
		animation: fade ease 300ms;
		animation-fill-mode: forwards;
	}

	@keyframes fade {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.json-holder {
		padding: var(--size-2);
		overflow-y: auto;
	}

	.empty-wrapper {
		min-height: calc(var(--size-32) - 20px);
		height: 100%;
	}
</style>
