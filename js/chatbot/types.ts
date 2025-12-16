import type { FileData } from "@gradio/client";
import type { UndoRetryData } from "./shared/utils";
import type {
	Gradio,
	SelectData,
	LikeData,
	CopyData,
	CustomButton
} from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";

export type MessageRole = "system" | "user" | "assistant";

export interface Metadata {
	title: string | null;
	id?: number | string | null;
	parent_id?: number | string | null;
	duration?: number;
	log?: string;
	status?: "pending" | "done" | null;
}

export interface ComponentData {
	component: string;
	constructor_args: any;
	props: any;
	value: any;
	alt_text: string | null;
}

export interface Option {
	label?: string;
	value: string;
}

export interface Text {
	type: "text";
	text: string;
}

export interface Component {
	type: "component";
	component: string;
	constructor_args: object;
	props: object;
	value: any;
	alt_text: string | null;
}

export interface File {
	type: "file";
	file: FileData;
	alt_text: string | null;
}

export interface Message {
	role: MessageRole;
	metadata: Metadata;
	content: (Text | File | Component)[];
	index: number | [number, number];
	options?: Option[];
}

export interface TextMessage {
	type: "text";
	content: string;
	index: number | [number, number];
	options?: Option[];
	role: MessageRole;
	metadata: Metadata;
}

export interface ComponentMessage {
	type: "component";
	content: ComponentData;
	index: number | [number, number];
	options?: Option[];
	role: MessageRole;
	metadata: Metadata;
}

export interface ExampleMessage {
	icon?: FileData;
	display_text?: string;
	text: string;
	files?: FileData[];
}

export type message_data =
	| string
	| { file: FileData | FileData[]; alt_text: string | null }
	| { component: string; value: any; constructor_args: any; props: any }
	| null;

export type NormalisedMessage = TextMessage | ComponentMessage;

export type ThoughtNode = NormalisedMessage & { children: ThoughtNode[] };

export interface ChatbotEvents {
	change: Message[];
	select: SelectData;
	share: ShareData;
	error: string;
	like: LikeData;
	clear_status: LoadingStatus;
	example_select: SelectData;
	option_select: SelectData;
	edit: SelectData;
	retry: UndoRetryData;
	undo: UndoRetryData;
	clear: null;
	copy: CopyData;
	custom_button_click: { id: number };
}

export interface ChatbotProps {
	autoscroll: boolean;
	messages: Message[];
	examples: ExampleMessage[] | null;
	allow_undo: boolean;
	allow_retry: boolean;
	root: string;
	proxy_url: null | string;
	max_messages: number | null;
	avatar_images: [FileData | null, FileData | null];
	like_user_message: boolean;
	height: number | string | undefined;
	resizable: boolean;
	min_height: number | string | undefined;
	max_height: number | string | undefined;
	editable: "user" | "all" | null;
	placeholder: string | null;
	allow_file_downloads: boolean;
	watermark: string | null;
	value: Message[];
	_selectable: boolean;
	likeable: boolean;
	feedback_options: string[];
	feedback_value: (string | null)[] | null;
	buttons: (string | CustomButton)[] | null;
	rtl: boolean;
	sanitize_html: boolean;
	layout: "bubble" | "panel";
	type: "tuples" | "messages";
	render_markdown: boolean;
	line_breaks: boolean;
	group_consecutive_messages: boolean;
	allow_tags: string[] | boolean;
	latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	_retryable: boolean;
	_undoable: boolean;
}
