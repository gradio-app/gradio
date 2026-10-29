<script lang="ts">
	import type { ToastMessage, GroupedToastMessage } from "./types";
	import ToastContent from "./ToastContent.svelte";
	import { spring } from "svelte/motion";
	import { on_page_info } from "@gradio/utils";

	interface Props {
		messages?: ToastMessage[];
		on_close: (id: number) => void;
	}

	let { messages = [], on_close }: Props = $props();
	const top = spring(0, { stiffness: 0.4, damping: 0.5 });

	let grouped_messages: GroupedToastMessage[] = $state([]);

	// Keep the toasts in view of an embedding page while there are any.
	$effect(() => {
		if (!messages.length) return;
		return on_page_info((page_info) =>
			top.set(Math.max(0, page_info.scrollTop - page_info.offsetTop))
		);
	});

	$effect(() => {
		grouped_messages = group_messages(messages);
	});

	function group_messages(msgs: ToastMessage[]): GroupedToastMessage[] {
		const groups = new Map<string, GroupedToastMessage>();

		msgs.forEach((msg) => {
			const key = msg.type;
			if (!groups.has(key)) {
				groups.set(key, {
					type: msg.type,
					messages: [],
					expanded: true
				});
			}
			groups.get(key)!.messages.push(msg);
		});

		return Array.from(groups.values());
	}

	function toggle_group(type: string): void {
		grouped_messages = grouped_messages.map((group) => {
			if (group.type === type) {
				return { ...group, expanded: !group.expanded };
			}
			return group;
		});
	}
</script>

<div class="toast-wrap" style="--toast-top: {$top}px;">
	{#each grouped_messages as group (group.type)}
		<div class="toast-item">
			<ToastContent
				type={group.type}
				messages={group.messages}
				expanded={group.expanded}
				ontoggle={() => toggle_group(group.type)}
				onclose={(id) => on_close(id)}
			/>
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		--toast-top: var(--size-4);
		display: flex;
		position: fixed;
		top: calc(var(--toast-top) + var(--size-3));
		flex-direction: column;
		gap: var(--size-2);
		z-index: var(--layer-top);
		right: var(--size-3);
		left: var(--size-3);
		align-items: end;
		max-width: none;
	}

	.toast-item {
		width: 100%;
	}

	@media (min-width: 640px) {
		.toast-wrap {
			left: auto;
			width: calc(var(--size-96) + var(--size-10));
		}
	}
</style>
