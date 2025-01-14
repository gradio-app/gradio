import type { FileData } from "@gradio/client";

export type MessageRole = "system" | "user" | "assistant";

export interface Metadata {
	title: string | null;
	id?: number | string | null;
	parent_id?: number | string | null;
	duration?: number;
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
export interface Message {
	role: MessageRole;
	metadata: Metadata;
	content: string | FileData | ComponentData;
	index: number | [number, number];
	options?: Option[];
}

export interface TextMessage extends Message {
	type: "text";
	content: string;
}

export interface ComponentMessage extends Message {
	type: "component";
	content: ComponentData;
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

export type TupleFormat = [message_data, message_data][] | null;

export type NormalisedMessage = TextMessage | ComponentMessage;

export type ThoughtNode = NormalisedMessage & { children: ThoughtNode[] };
