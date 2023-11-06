import type { Container } from "pixi.js";
import { type Command, make_graphics } from "./commands";

interface CommandManager {
	undo(): void;
	redo(): void;
	execute(command: Command): void;
	readonly can_undo: boolean;
	readonly can_redo: boolean;
}

interface CommandNode {
	command: Command | null;
	next: CommandNode | null;
	previous: CommandNode | null;
	push(command: Command): void;
}

function command_node(command?: Command): CommandNode {
	return {
		command: command || null,
		next: null,
		previous: null,
		push: function (command: Command) {
			const node = command_node(command);
			node.previous = this;
			this.next = node;
		}
	};
}

export function command_manager(): CommandManager {
	let history: CommandNode = command_node();
	return {
		undo: function () {
			if (history.previous) {
				history.previous.command?.undo();
				history = history.previous;
			}
		},
		redo: function () {
			if (history.next) {
				history.next.command?.execute();
				history = history.next;
			}
		},
		execute: function (command: Command) {
			command.execute();
			history.push(command);
		},
		get can_undo() {
			return !!history.previous;
		},
		get can_redo() {
			return !!history.next;
		}
	};
}

interface LayerManager {
	add_layer(position: number, layer: Container): void;
	// remove_layer(layer: Container): void;

	swap_layers(layer_1: number, layer_2: number): void;
	change_active_layer(layer: number): void;
	// current_layer: number;
	// layers: Layer[];
}

interface Layer {
	layer: Container;
	next: Layer | null;
	previous: Layer | null;
	push: (layer: Container) => void;
}

function swap_nodes(node_1: Layer, node_2: Layer): void {
	const tempNext = node_2.next;
	const tempPrev = node_1.previous;

	if (tempPrev) {
		tempPrev.next = node_2;
	}
	if (tempNext) {
		tempNext.previous = node_1;
	}

	node_1.next = tempNext;
	node_1.previous = node_2;

	node_2.next = node_1;
	node_2.previous = tempPrev;
}

function create_layer(container: Container): Layer {
	return {
		layer: container,
		next: null,
		previous: null,
		push: function (layer: Container) {
			const node = create_layer(layer);
			node.previous = this;
			this.next = node;
		}
	};
}

export function layer_manager(initial_layer: Container): LayerManager {
	let _layer: Layer = create_layer(initial_layer);

	return {
		add_layer: function (position: number, container: Container): void {
			const layer = make_graphics(position);
			const node = create_layer(layer);
			if (position === 0) {
				node.next = _layer;
				_layer.previous = node;
				_layer = node;

				let current_layer = _layer;
				for (let i = 1; i < position - 1; i++) {
					current_layer.layer.zIndex = i;
					current_layer = current_layer.next!;
				}
			} else {
				let current_layer = _layer;
				for (let i = 0; i < position - 1; i++) {
					current_layer = current_layer.next!;
				}
				node.next = current_layer.next;
				node.previous = current_layer;
				current_layer.next = node;
				if (node.next) {
					node.next.previous = node;
				}

				for (let i = position; i < position - 1; i++) {
					current_layer.layer.zIndex = i;
					current_layer = current_layer.next!;
				}
			}
		},

		swap_layers: function (layer_1: number, layer_2: number): void {
			let current_layer = _layer;
			let max = Math.max(layer_1, layer_2);
			let min = Math.min(layer_1, layer_2);
			let layer_1_node: Layer | null = null;
			let layer_2_node: Layer | null = null;

			for (let i = min; i < max; i++) {
				if (i === layer_1) layer_1_node = current_layer;

				if (i === layer_2) layer_2_node = current_layer;

				current_layer = current_layer.next!;
			}

			if (layer_1_node && layer_2_node) swap_nodes(layer_1_node, layer_2_node);
		},

		change_active_layer: function (layer: number): void {
			let current_layer = _layer;
			for (let i = 0; i < layer; i++) {
				current_layer = current_layer.next!;
			}
			_layer = current_layer;
		}
	};
}
