<script lang="ts">
	import type { DAGNode, DAGEdge, PendingConnection, Position } from "./types";

	let {
		nodes,
		positions,
		edges,
		pending,
		ondisconnect
	}: {
		nodes: Map<string, DAGNode>;
		positions: Record<string, Position>;
		edges: DAGEdge[];
		pending: PendingConnection | null;
		ondisconnect: (edge_id: string) => void;
	} = $props();

	function get_port(
		node_id: string,
		side: "left" | "right" | "top" | "bottom"
	): Position | null {
		const node = nodes.get(node_id);
		const pos = positions[node_id];
		if (!node || !pos) return null;
		const { width, height } = node;
		switch (side) {
			case "right":
				return { x: pos.x + width, y: pos.y + height / 2 };
			case "left":
				return { x: pos.x, y: pos.y + height / 2 };
			case "bottom":
				return { x: pos.x + width / 2, y: pos.y + height };
			case "top":
				return { x: pos.x + width / 2, y: pos.y };
		}
	}

	function bezier(
		from: Position,
		to: Position,
		dir: "horizontal" | "vertical"
	): string {
		if (dir === "horizontal") {
			const cx = Math.max(Math.abs(to.x - from.x) * 0.5, 40);
			return `M ${from.x} ${from.y} C ${from.x + cx} ${from.y}, ${to.x - cx} ${to.y}, ${to.x} ${to.y}`;
		} else {
			const cy = Math.max(Math.abs(to.y - from.y) * 0.5, 30);
			return `M ${from.x} ${from.y} C ${from.x} ${from.y + cy}, ${to.x} ${to.y - cy}, ${to.x} ${to.y}`;
		}
	}

	interface EdgePath {
		edge: DAGEdge;
		d: string;
		color: string;
		label_pos: Position | null;
	}

	let edge_paths: EdgePath[] = $derived.by(() => {
		const result: EdgePath[] = [];
		for (const edge of edges) {
			let from_pos: Position | null;
			let to_pos: Position | null;
			let color: string;
			let dir: "horizontal" | "vertical";
			let label_pos: Position | null = null;

			if (edge.type === "input") {
				from_pos = get_port(edge.from_node_id, "right");
				to_pos = get_port(edge.to_node_id, "left");
				color = "#3b82f6";
				dir = "horizontal";
			} else if (edge.type === "output") {
				from_pos = get_port(edge.from_node_id, "right");
				to_pos = get_port(edge.to_node_id, "left");
				color = "#22c55e";
				dir = "horizontal";
			} else {
				from_pos = get_port(edge.from_node_id, "bottom");
				to_pos = get_port(edge.to_node_id, "top");
				color = "#f97316";
				dir = "vertical";
			}

			if (!from_pos || !to_pos) continue;

			if (edge.type === "trigger" && edge.label) {
				label_pos = {
					x: (from_pos.x + to_pos.x) / 2,
					y: (from_pos.y + to_pos.y) / 2
				};
			}

			result.push({
				edge,
				d: bezier(from_pos, to_pos, dir),
				color,
				label_pos
			});
		}
		return result;
	});

	let pending_path: string | null = $derived.by(() => {
		if (!pending) return null;
		const from_pos = get_port(pending.from.node_id, pending.from.side);
		if (!from_pos) return null;
		const dir =
			pending.from.side === "bottom" || pending.from.side === "top"
				? "vertical"
				: "horizontal";
		return bezier(from_pos, pending.cursor, dir);
	});

	let canvas_size = $derived.by(() => {
		let max_x = 900;
		let max_y = 600;
		for (const [key, node] of nodes) {
			const pos = positions[key];
			if (pos) {
				max_x = Math.max(max_x, pos.x + node.width + 100);
				max_y = Math.max(max_y, pos.y + node.height + 100);
			}
		}
		return { width: max_x, height: max_y };
	});
</script>

<svg
	class="dag-edges"
	width={canvas_size.width}
	height={canvas_size.height}
	xmlns="http://www.w3.org/2000/svg"
>
	{#each edge_paths as { edge, d, color, label_pos }}
		<!-- Invisible hitbox for click-to-disconnect -->
		<path
			d={d}
			fill="none"
			stroke="transparent"
			stroke-width="12"
			style="pointer-events: stroke; cursor: pointer;"
			onclick={() => ondisconnect(edge.id)}
		/>
		<!-- Visible edge -->
		<path
			d={d}
			fill="none"
			stroke={color}
			stroke-width="2"
			style="pointer-events: none;"
		/>
		<!-- Arrow at end -->
		<circle
			cx={d.split(" ").slice(-2)[0]}
			cy={d.split(" ").slice(-1)[0]}
			r="4"
			fill={color}
			style="pointer-events: none;"
		/>
		{#if label_pos}
			<rect
				x={label_pos.x - 24}
				y={label_pos.y - 10}
				width="48"
				height="20"
				rx="4"
				fill="white"
				stroke={color}
				stroke-width="1"
				style="pointer-events: none;"
			/>
			<text
				x={label_pos.x}
				y={label_pos.y + 4}
				text-anchor="middle"
				font-size="11"
				fill={color}
				style="pointer-events: none; font-family: sans-serif;"
			>
				{edge.label}
			</text>
		{/if}
	{/each}
	{#if pending_path}
		<path
			d={pending_path}
			fill="none"
			stroke="#94a3b8"
			stroke-width="2"
			stroke-dasharray="6 3"
			style="pointer-events: none;"
		/>
	{/if}
</svg>

<style>
	.dag-edges {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: visible;
	}
</style>
