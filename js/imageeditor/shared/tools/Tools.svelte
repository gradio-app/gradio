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
		register_tool: (type: tool, meta: ToolMeta) => () => void;
		active_tool: {
			subscribe(
				this: void,
				run: Subscriber<tool | null>,
				invalidate?: Invalidator<tool | null>
			): Unsubscriber;
		};
		activate_subtool: (
			sub_tool: upload_tool | transform_tool | brush_tool | eraser_tool | null,
			cb?: (...args: any[]) => void
		) => void;
		current_color: Writable<string>;
	}
</script>

<script lang="ts">
	import { Toolbar, IconButton } from "@gradio/atoms";
	import { getContext, setContext } from "svelte";
	import { writable } from "svelte/store";
	import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";
	import { Image, Crop, Brush, Erase } from "@gradio/icons";
	import { type I18nFormatter } from "@gradio/utils";

	const { current_history, active_tool } =
		getContext<EditorContext>(EDITOR_KEY);

	export let i18n: I18nFormatter;

	let tools: tool[] = [];

	const metas: Record<tool, ToolMeta | null> = {
		draw: null,
		erase: null,
		crop: null,
		bg: null
	};

	$: sub_menu = $active_tool && metas[$active_tool];
	let current_color = writable("#000000");
	let sub_tool: upload_tool | transform_tool | brush_tool | eraser_tool | null;
	const tool_context: ToolContext = {
		current_color,
		register_tool: (type: tool, meta: ToolMeta) => {
			tools = [...tools, type];
			metas[type] = meta;

			return () => {
				tools = tools.filter((tool) => tool !== type);
			};
		},

		active_tool: {
			subscribe: active_tool.subscribe
		},

		activate_subtool: (
			_sub_tool: upload_tool | transform_tool | brush_tool | eraser_tool | null,
			cb?: (...args: any[]) => void
		) => {
			sub_tool = _sub_tool;
			if (cb) cb();
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
		bg: {
			order: 0,
			label: i18n("Image"),
			icon: Image
		},
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
		}
	} as const;
</script>

<slot />

<div class="toolbar-wrap">
	<Toolbar show_border={false}>
		{#if sub_menu}
			{#each sub_menu.options as meta (meta.id)}
				<IconButton
					highlight={sub_tool === meta.id && meta.id !== "brush_size"}
					color={$active_tool === "draw" && meta.id === "brush_size"
						? $current_color
						: undefined}
					on:click={() => tool_context.activate_subtool(meta.id, meta.cb)}
					Icon={meta.icon}
					size="large"
					padded={false}
					label={meta.label + " button"}
					hasPopup={true}
					transparent={true}
				/>
			{/each}
		{/if}
	</Toolbar>

	<Toolbar show_border={false}>
		{#each tools as tool (tool)}
			<IconButton
				disabled={tool === "bg" && !!$current_history.previous}
				highlight={$active_tool === tool}
				on:click={() => ($active_tool = tool)}
				Icon={tools_meta[tool].icon}
				size="large"
				padded={false}
				label={tools_meta[tool].label + " button"}
				transparent={true}
			/>
		{/each}
	</Toolbar>
</div>

<style>
	.toolbar-wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
	}
</style>
