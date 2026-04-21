<script lang="ts">
	import { workflow } from "./workflow-store";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType, WFNode } from "./workflow-types";

	interface Props {
		pending: {
			from_node_id: string;
			from_port_id: string;
			type: PortType;
			x: number;
			y: number;
		} | null;
		onremove: (id: string) => void;
	}

	let { pending, onremove }: Props = $props();

	function bez(x1: number, y1: number, x2: number, y2: number): string {
		const cx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
		return `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`;
	}

	function getPortPos(
		nodes: WFNode[],
		nodeId: string,
		portId: string,
		side: "output" | "input"
	): { x: number; y: number } {
		// Try DOM measurement first
		const dotEl = document.querySelector(`[data-port-id="${nodeId}:${portId}:${side}"]`);
		const transformEl = document.querySelector('.canvas-transform');
		if (dotEl && transformEl) {
			const dotRect = dotEl.getBoundingClientRect();
			const transformRect = transformEl.getBoundingClientRect();
			const zoom = transformRect.width === 0 ? 1 :
				parseFloat(getComputedStyle(transformEl).transform.split(',')[0]?.replace('matrix(', '') || '1') || 1;
			return {
				x: (dotRect.left + dotRect.width / 2 - transformRect.left) / zoom,
				y: (dotRect.top + dotRect.height / 2 - transformRect.top) / zoom
			};
		}

		// Fallback to calculated positions
		const node = nodes.find((n) => n.id === nodeId);
		if (!node) return { x: 0, y: 0 };

		const ports = side === "output" ? node.outputs : node.inputs;
		const idx = ports.findIndex((p) => p.id === portId);
		const portIndex = idx >= 0 ? idx : 0;

		const x = side === "output" ? node.x + node.width : node.x;
		const headerH = node.source === "space" && node.space_id ? 60 : 44;

		if (side === "input") {
			return { x, y: node.y + headerH + portIndex * 26 };
		} else {
			const portsBlockH = ports.length * 26;
			const y = node.y + node.height - portsBlockH + portIndex * 26 - 2;
			return { x, y };
		}
	}
</script>

<svg class="edge-layer">
	<defs>
		{#each $workflow.edges as edge (edge.id)}
			<linearGradient
				id="grad-{edge.id}"
				x1="0%"
				y1="0%"
				x2="100%"
				y2="0%"
			>
				<stop
					offset="0%"
					stop-color={PORT_COLOR[edge.type]}
					stop-opacity="0.9"
				/>
				<stop
					offset="100%"
					stop-color={PORT_COLOR[edge.type]}
					stop-opacity="0.4"
				/>
			</linearGradient>
		{/each}
	</defs>

	{#each $workflow.edges as edge (edge.id)}
		{@const from = getPortPos(
			$workflow.nodes,
			edge.from_node_id,
			edge.from_port_id,
			"output"
		)}
		{@const to = getPortPos(
			$workflow.nodes,
			edge.to_node_id,
			edge.to_port_id,
			"input"
		)}
		<!-- glow -->
		<path
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke={PORT_COLOR[edge.type]}
			stroke-width="6"
			stroke-opacity="0.08"
			style="pointer-events: none"
		/>
		<!-- hitbox -->
		<path
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke="transparent"
			stroke-width="16"
			style="pointer-events: stroke; cursor: pointer"
			onclick={() => onremove(edge.id)}
			role="button"
			tabindex="-1"
		/>
		<!-- wire -->
		<path
			class="wire"
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke="url(#grad-{edge.id})"
			stroke-width="2"
			style="pointer-events: none"
		/>
		<!-- flow particles -->
		<path
			class="wire-flow"
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke={PORT_COLOR[edge.type]}
			stroke-width="2"
			stroke-dasharray="4 12"
			stroke-opacity="0.5"
			style="pointer-events: none"
		/>
		<!-- end diamond -->
		<rect
			x={to.x - 3.5}
			y={to.y - 3.5}
			width="7"
			height="7"
			rx="1"
			fill={PORT_COLOR[edge.type]}
			transform="rotate(45 {to.x} {to.y})"
			style="pointer-events: none"
		/>
	{/each}

	{#if pending}
		{@const from = getPortPos(
			$workflow.nodes,
			pending.from_node_id,
			pending.from_port_id,
			"output"
		)}
		<path
			d={bez(from.x, from.y, pending.x, pending.y)}
			fill="none"
			stroke="#5c5e6a"
			stroke-width="2"
			stroke-dasharray="6 4"
			stroke-opacity="0.6"
			style="pointer-events: none"
		/>
		<circle
			cx={pending.x}
			cy={pending.y}
			r="4"
			fill="none"
			stroke="#5c5e6a"
			stroke-width="1.5"
			stroke-opacity="0.5"
			style="pointer-events: none"
		/>
	{/if}
</svg>

<style>
	.edge-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 1px;
		overflow: visible;
		pointer-events: none;
	}

	.wire-flow {
		animation: flow 1.2s linear infinite;
	}

	@keyframes flow {
		to {
			stroke-dashoffset: -16;
		}
	}
</style>
