<script lang="ts">
	import type { ToastMessage, GroupedToastMessage } from "./types";
	import ToastContent from "./ToastContent.svelte";
	import { spring } from "svelte/motion";

	export let messages: ToastMessage[] = [];
	export let on_close: (id: number) => void;
	const top = spring(0, { stiffness: 0.4, damping: 0.5 });

	let grouped_messages: GroupedToastMessage[] = [];

	$: scroll_to_top(messages);
	$: grouped_messages = group_messages(messages);

	function group_messages(msgs: ToastMessage[]): GroupedToastMessage[] {
		const groups = new Map<string, GroupedToastMessage>();

		msgs.forEach((msg) => {
			const key = msg.type;
			if (!groups.has(key)) {
				groups.set(key, {
					type: msg.type,
					messages: [],
					expanded: true,
				});
			}
			groups.get(key)!.messages.push(msg);
		});

		return Array.from(groups.values());
	}

	function scroll_to_top(_messages: ToastMessage[]): void {
		if (_messages.length > 0) {
			if ("parentIFrame" in window) {
				window.parentIFrame?.getPageInfo((page_info) => {
					if (page_info.scrollTop < page_info.offsetTop) {
						top.set(0);
					} else {
						top.set(page_info.scrollTop - page_info.offsetTop);
					}
				});
			}
		}
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
				on:toggle={() => toggle_group(group.type)}
				on:close={(e) => on_close(e.detail)}
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

	@media (--screen-sm) {
		.toast-wrap {
			left: auto;
			width: calc(var(--size-96) + var(--size-10));
		}
	}
</style>
