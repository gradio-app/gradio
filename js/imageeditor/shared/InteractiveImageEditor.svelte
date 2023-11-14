<script lang="ts">
	import { type I18nFormatter } from "@gradio/utils";

	import ImageEditor from "./ImageEditor.svelte";
	import Layers from "./layers/Layers.svelte";
	import { type Brush as IBrush } from "./tools/Brush.svelte";
	import { type Eraser } from "./tools/Brush.svelte";

	export let transforms: ("crop" | "rotate")[];
	export let brush: IBrush;
	export let eraser: Eraser;
	import { Tools, Crop, Brush, type tool, Sources } from "./tools";

	export let crop_size: [number, number, number, number] | null = null;
	export let i18n: I18nFormatter;
	export let root: string;
	// let active_tool: tool = "brush";
</script>

<ImageEditor>
	<Tools {i18n}>
		<Sources {i18n} {root}></Sources>
		<Crop {crop_size} />
		<Brush
			sizes={brush.sizes}
			size_mode={brush.size_mode}
			color_mode={brush.color_mode}
			default_color={brush.default_color}
			default_size={brush.default_size}
			antialias={brush.antialias}
			colors={brush.colors}
			mode="draw"
		/>
		<Brush
			sizes={eraser.sizes}
			size_mode={eraser.size_mode}
			default_size={eraser.default_size}
			antialias={eraser.antialias}
			mode="erase"
		/>
	</Tools>

	<Layers />
</ImageEditor>
