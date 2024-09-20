import type { FileData } from "@gradio/client";

export type MessageRole = "system" | "user" | "assistant";

export interface Metadata {
	title: string | null;
}

export interface ComponentData {
	component: string;
	constructor_args: any;
	props: any;
	value: any;
	alt_text: string | null;
}

export interface FileContent {
	file: FileData;
	alt_text: string | null;
}

export interface Message {
	role: MessageRole;
	metadata: Metadata;
	content: string | FileContent | ComponentData;
	index: number | [number, number];
}

export interface TextMessage extends Message {
	type: "text";
	content: string;
}

export interface ComponentMessage extends Message {
	type: "component";
	content: ComponentData;
}

export type message_data = string | FileContent | ComponentData | null;

export type TupleFormat = [message_data, message_data][] | null;

export type NormalisedMessage = TextMessage | ComponentMessage;
