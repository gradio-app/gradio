import type { FileData } from "@gradio/client";

export type MessageRole = "system" | "user" | "assistant";

export interface Metadata {
	error: boolean;
	tool_name: string | null;
}

export interface Message {
	role: MessageRole;
	metadata: Metadata;
	content: string | FileData;
}

export interface ChatFileMessage extends Message {
	content: FileData;
}

export interface ChatStringMessage extends Message {
	content: string;
}

export type TupleFormat = [
	string | { file: FileData; alt_text: string | null } | null,
	string | { file: FileData; alt_text: string | null } | null
][];
