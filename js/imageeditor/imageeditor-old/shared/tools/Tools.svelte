<script lang="ts" context="module">
	import type {
		Subscriber,
		Invalidator,
		Unsubscriber,
		Writable
	} from "svelte/store";
	import type { tool } from "../tools/";

	export const TOOL_KEY = Symbol("tool");

	type upload_tool = "bg_webcam" | "bg_upload" | "bg_clipboard" | "bg_color";
	type transform_tool = "crop" | "rotate";
	type brush_tool = "brush_color" | "brush_size";
	type eraser_tool = "eraser_size";

	export interface ToolOptions {
		order: number;
		label: string;
		icon: typeof Image;
		cb: (...args: any[]) => void;
		id: upload_tool | transform_tool | brush_tool | eraser_tool;
	}

	export interface ToolMeta {
		default: upload_tool | transform_tool | brush_tool | eraser_tool | null;
		options: ToolOptions[];
	}

	export interface ToolContext {
		register_tool: (type: tool, opts?: { cb: () => void }) => () => void;
		active_tool: {
			set: (tool: tool) => void;
			subscribe(
				this: void,
				run: Subscriber<tool | null>,
				invalidate?: Invalidator<tool | null>
			): Unsubscriber;
		};

		current_color: Writable<string>;
	}
</script>

<script lang="ts">
	import { Toolbar } from "@gradio/atoms";
	import { default as IconButton } from "./IconButton.svelte";
	import { getContext, setContext } from "svelte";
	import { writable } from "svelte/store";
	import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";
	import { Image, Crop, Brush, Erase } from "@gradio/icons";
	import { type I18nFormatter } from "@gradio/utils";

	const { active_tool, toolbar_box, editor_box } =
		getContext<EditorContext>(EDITOR_KEY);

	export let i18n: I18nFormatter;

	let tools: tool[] = [];

	const cbs: Record<string, () => void> = {};
	let current_color = writable("#000000");
	const tool_context: ToolContext = {
		current_color,
		register_tool: (type: tool, opts?: { cb: () => void }) => {
			tools = [...tools, type];
			if (opts?.cb) {
				cbs[type] = opts.cb;
			}

			return () => {
				tools = tools.filter((tool) => tool !== type);
			};
		},

		active_tool: {
			subscribe: active_tool.subscribe,
			set: active_tool.set
		}
	};

	setContext<ToolContext>(TOOL_KEY, tool_context);

	const tools_meta: Record<
		tool,
		{
			order: number;
			label: string;
			icon: typeof Image;
		}
	> = {
		crop: {
			order: 1,
			label: i18n("Transform"),
			icon: Crop
		},
		draw: {
			order: 2,
			label: i18n("Draw"),
			icon: Brush
		},
		erase: {
			order: 2,
			label: i18n("Erase"),
			icon: Erase
		},
		bg: {
			order: 0,
			label: i18n("Background"),
			icon: Image
		}
	} as const;

	let toolbar_width: number;
	let toolbar_wrap: HTMLDivElement;

	$: toolbar_width, $editor_box, get_dimensions();

	function get_dimensions(): void {
		if (!toolbar_wrap) return;
		$toolbar_box = toolbar_wrap.getBoundingClientRect();
	}

	function handle_click(e: Event, tool: tool): void {
		e.stopPropagation();
		$active_tool = tool;
		cbs[tool] && cbs[tool]();
	}
</script>

<slot />

<div
	class="toolbar-wrap"
	bind:clientWidth={toolbar_width}
	bind:this={toolbar_wrap}
>
	<Toolbar show_border={false}>
		{#each tools as tool (tool)}
			<IconButton
				highlight={$active_tool === tool}
				on:click={(e) => handle_click(e, tool)}
				Icon={tools_meta[tool].icon}
				size="medium"
				padded={false}
				label={tools_meta[tool].label + " button"}
				transparent={true}
				offset={tool === "draw" ? -2 : tool === "erase" ? -6 : 0}
			/>
		{/each}
	</Toolbar>
</div>

<style>
	.toolbar-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: var(--spacing-xl);
		height: 100%;
	}
</style>
