<script lang="ts">
	import { PORT_COLOR } from "./workflow-types";
	import { GROUP_HEADER, PROXY_IN, PROXY_OUT } from "./workflow-groups";
	import type { GroupBox } from "./workflow-groups";

	interface Props {
		box: GroupBox;
		/**
		 * Which pass this is. The expanded frame's body has to paint *below* the
		 * edges so wires read as running through the group, but its header has to
		 * sit *above* them — `.edge-path` has `pointer-events: stroke` and a
		 * click handler that deletes, so a header underneath would turn every
		 * edge crossing that strip into a mine. A collapsed group is a card and
		 * belongs in front with the nodes.
		 */
		layer: "back" | "front";
		selected?: boolean;
		readOnly?: boolean;
		ontoggle: (id: string) => void;
		onrename: (id: string, label: string) => void;
		onheaderpointerdown: (e: PointerEvent, id: string) => void;
	}

	let {
		box,
		layer,
		selected = false,
		readOnly = false,
		ontoggle,
		onrename,
		onheaderpointerdown,
	}: Props = $props();

	/** Names shown on a collapsed card before the rest become a "+N" chip. */
	const MEMBER_PREVIEW = 4;

	let editing = $state(false);
	let draft = $state("");

	function start_edit(): void {
		if (readOnly) return;
		draft = box.label;
		editing = true;
	}

	function commit(): void {
		if (!editing) return;
		editing = false;
		const next = draft.trim();
		if (next && next !== box.label) onrename(box.id, next);
	}

	const show_back = $derived(layer === "back" && !box.collapsed);
	const show_front = $derived(layer === "front");
</script>

{#snippet header()}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="group-header"
		ondblclick={(e) => {
			e.stopPropagation();
			start_edit();
		}}
		onpointerdown={(e) => onheaderpointerdown(e, box.id)}
	>
		<button
			class="group-caret"
			aria-label={box.collapsed ? "Expand group" : "Collapse group"}
			onpointerdown={(e) => e.stopPropagation()}
			onclick={(e) => {
				e.stopPropagation();
				ontoggle(box.id);
			}}
		>
			{box.collapsed ? "▸" : "▾"}
		</button>
		{#if editing}
			<!-- An <input>, not contenteditable: the canvas's delete handler skips
			     keystrokes by tagName, so Backspace in a contenteditable label
			     would fall through and delete the selected nodes. -->
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="group-label-input nodrag"
				bind:value={draft}
				autofocus
				onpointerdown={(e) => e.stopPropagation()}
				onblur={commit}
				onkeydown={(e) => {
					e.stopPropagation();
					if (e.key === "Enter") commit();
					else if (e.key === "Escape") editing = false;
				}}
			/>
		{:else}
			<span class="group-label">{box.label}</span>
		{/if}
		<span class="group-count">{box.member_ids.length}</span>
	</div>
{/snippet}

{#if show_back}
	<div
		class="group-frame"
		class:group-selected={selected}
		style="left: {box.x}px; top: {box.y}px; width: {box.width}px; height: {box.height}px;"
	></div>
{/if}

{#if show_front && !box.collapsed}
	<div
		class="group-header-wrap"
		style="left: {box.x}px; top: {box.y}px; width: {box.width}px; height: {GROUP_HEADER}px;"
	>
		{@render header()}
	</div>
{/if}

{#if show_front && box.collapsed}
	<div
		class="group-card"
		class:group-selected={selected}
		data-node-id={box.id}
		style="left: {box.x}px; top: {box.y}px; width: {box.width}px;"
	>
		{@render header()}
		<div class="group-members">
			{#each box.member_labels.slice(0, MEMBER_PREVIEW) as label, i (i)}
				<span class="group-member">{label}</span>
			{/each}
			{#if box.member_labels.length > MEMBER_PREVIEW}
				<span class="group-member group-member-more"
					>+{box.member_labels.length - MEMBER_PREVIEW}</span
				>
			{/if}
		</div>
		<div class="group-stubs">
			{#if box.in_type}
				<div
					class="group-handle group-handle-in"
					data-node-id={box.id}
					data-port-id={PROXY_IN}
					data-port-type={box.in_type}
					data-port-direction="input"
					style="--port-color: {PORT_COLOR[box.in_type]}"
				></div>
				<span class="group-stub-label">in</span>
			{/if}
			{#if box.out_type}
				<span class="group-stub-label group-stub-out">out</span>
				<div
					class="group-handle group-handle-out"
					data-node-id={box.id}
					data-port-id={PROXY_OUT}
					data-port-type={box.out_type}
					data-port-direction="output"
					style="--port-color: {PORT_COLOR[box.out_type]}"
				></div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* No z-index, opacity, filter or transform here: this element paints below
	 * the edges purely by DOM order among z-index:auto siblings, and any of
	 * those properties would promote it above them. */
	.group-frame {
		position: absolute;
		border: 1px solid #2f3040;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.022);
		pointer-events: none;
		box-sizing: border-box;
	}

	.group-frame.group-selected {
		border-color: #4d9cf5;
	}

	.group-header-wrap {
		position: absolute;
		z-index: 1;
	}

	.group-card {
		position: absolute;
		z-index: 1;
		background: #16171f;
		border: 1px solid #2f3040;
		border-radius: 10px;
		font-family: "Manrope", sans-serif;
		user-select: none;
		box-sizing: border-box;
	}

	.group-card.group-selected {
		border-color: #4d9cf5;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 20px;
		padding: 0 8px;
		font-size: 11px;
		color: #9ca0ad;
		cursor: grab;
		white-space: nowrap;
		overflow: hidden;
	}

	.group-card .group-header {
		height: 28px;
		border-bottom: 1px solid #24252e;
		color: #d5d8e0;
	}

	.group-header:active {
		cursor: grabbing;
	}

	.group-caret {
		background: none;
		border: none;
		padding: 0;
		color: inherit;
		font-size: 10px;
		line-height: 1;
		cursor: pointer;
	}

	.group-label {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.group-label-input {
		flex: 1;
		min-width: 0;
		background: #0c0d10;
		border: 1px solid #3a3c4a;
		border-radius: 4px;
		color: #e8eaf0;
		font: inherit;
		padding: 1px 4px;
	}

	.group-count {
		margin-left: auto;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
	}

	.group-members {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px 10px 0;
	}

	.group-member {
		max-width: 100%;
		padding: 2px 6px;
		border-radius: 4px;
		background: #1e1f29;
		color: #9ca0ad;
		font-size: 10px;
		line-height: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.group-member-more {
		background: none;
		color: #6b6e78;
	}

	.group-stubs {
		position: relative;
		display: flex;
		align-items: center;
		height: 30px;
		padding: 0 10px;
		font-size: 10px;
		color: #6b6e78;
	}

	.group-stub-out {
		margin-left: auto;
	}

	/* Matches .port-handle-sf so a folded group's stubs read as ports. */
	.group-handle {
		position: absolute;
		top: 50%;
		width: 12px;
		height: 12px;
		border: 2px solid var(--port-color);
		background: var(--port-color);
		transform: translateY(-50%);
		/* Display only — there is no unambiguous port to connect to. */
		pointer-events: none;
	}

	.group-handle-in {
		left: -24px;
		border-radius: 50%;
	}

	.group-handle-out {
		right: -24px;
		border-radius: 2px;
		transform: translateY(-50%) rotate(45deg);
	}

	:global(body:not(.dark)) .group-card {
		background: #fff;
		border-color: #d8dae2;
	}

	:global(body:not(.dark)) .group-card .group-header {
		color: #2b2d36;
		border-bottom-color: #e6e8ee;
	}

	:global(body:not(.dark)) .group-member {
		background: #f1f2f6;
		color: #55576a;
	}

	:global(body:not(.dark)) .group-frame {
		border-color: #d8dae2;
		background: rgba(0, 0, 0, 0.018);
	}
</style>
