import type { SelectData, ShareData, CustomButton } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import type { CommandNode } from "./shared/core/commands";
import type {
	LayerOptions,
	Source,
	Transform,
	WebcamOptions
} from "./shared/types";
import type { Brush, Eraser } from "./shared/brush/types";
import type { EditorData } from "./InteractiveImageEditor.svelte";
import type { ImageBlobs } from "./shared/types";

export interface ImageEditorEvents {
	change: never;
	error: string;
	input: never;
	edit: never;
	drag: never;
	apply: never;
	upload: never;
	clear: never;
	select: SelectData;
	share: ShareData;
	clear_status: LoadingStatus;
}

export interface ImageEditorProps {
	border_region?: number;
	webcam_options?: WebcamOptions;
	value?: EditorData | null;
	buttons?: (string | CustomButton)[] | null;
	height?: number;
	width?: number;
	_selectable?: boolean;
	sources?: Source[];
	placeholder?: string | undefined;
	brush?: Brush;
	eraser?: Eraser;
	transforms?: Transform[];
	layers?: LayerOptions;
	server?: {
		accept_blobs: (a: any) => void;
	};
	canvas_size?: [number, number];
	fixed_canvas?: boolean;
	full_history?: CommandNode | null;
}

// export let border_region = 0;
// 	export let webcam_options: WebcamOptions;
// 	export let value: EditorData | null = {
// 		background: null,
// 		layers: [],
// 		composite: null,
// 	};
// 	export let buttons: string[] | null = null;
// 	export let height = 350;
// 	export let width: number | undefined;

// 	export let _selectable = false;
// 	export let sources: Source[] = [];
// 	export let placeholder: string | undefined;
// 	export let brush: Brush;
// 	export let eraser: Eraser;
// 	export let transforms: Transform[] = [];
// 	export let layers: LayerOptions;
// 	export let attached_events: string[] = [];
// 	export let server: {
// 		accept_blobs: (a: any) => void;
// 	};
// 	export let canvas_size: [number, number];
// 	export let fixed_canvas = false;
// 	export let full_history: CommandNode | null = null;
