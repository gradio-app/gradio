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
		zoom: number;
		panX: number;
		panY: number;
	}

	let { pending, onremove, zoom, panX, panY }: Props = $props();

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
		// DOM measurement — always accurate regardless of layout
		const dotEl = document.querySelector(`[data-port-id="${nodeId}:${portId}:${side}"]`);
		const transformEl = document.querySelector('.canvas-transform');
		if (dotEl && transformEl) {
			const dotRect = dotEl.getBoundingClientRect();
			const transformRect = transformEl.getBoundingClientRect();
			return {
				x: (dotRect.left + dotRect.width / 2 - transformRect.left) / zoom,
				y: (dotRect.top + dotRect.height / 2 - transformRect.top) / zoom
			};
		}

		// Fallback
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
			return { x, y: node.y + node.height - portsBlockH + portIndex * 26 - 2 };
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
			stroke-width={6 / zoom}
			stroke-opacity="0.08"
			style="pointer-events: none"
		/>
		<!-- hitbox -->
		<path
			class="wire-hitbox"
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke="transparent"
			stroke-width={16 / zoom}
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
			stroke-width={2 / zoom}
			style="pointer-events: none"
		/>
		<!-- flow particles -->
		<path
			class="wire-flow"
			d={bez(from.x, from.y, to.x, to.y)}
			fill="none"
			stroke={PORT_COLOR[edge.type]}
			stroke-width={2 / zoom}
			stroke-dasharray="{4 / zoom} {12 / zoom}"
			stroke-opacity="0.5"
			style="pointer-events: none"
		/>
		<!-- end diamond -->
		{@const ds = 3.5 / zoom}
		<rect
			x={to.x - ds}
			y={to.y - ds}
			width={ds * 2}
			height={ds * 2}
			rx={1 / zoom}
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
			stroke={PORT_COLOR[pending.type] ?? "#5c5e6a"}
			stroke-width={2 / zoom}
			stroke-dasharray="{6 / zoom} {4 / zoom}"
			stroke-opacity="0.6"
			style="pointer-events: none"
		/>
		<circle
			cx={pending.x}
			cy={pending.y}
			r={4 / zoom}
			fill="none"
			stroke={PORT_COLOR[pending.type] ?? "#5c5e6a"}
			stroke-width={1.5 / zoom}
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

	.wire-hitbox {
		pointer-events: stroke;
		cursor: pointer;
		transition: stroke 0.15s;
	}

	.wire-hitbox:hover {
		stroke: rgba(239, 68, 68, 0.25);
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
