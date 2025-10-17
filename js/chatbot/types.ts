import type { FileData } from "@gradio/client";

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

/*
class Message(GradioModel):
    role: str
    metadata: MetadataDict | None = None
    content: list[Union[TextMessage, FileMessage, ComponentMessage]]
    options: list[OptionDict] | None = None

class ComponentMessage(GradioModel):
    component: str
    value: Any
    constructor_args: dict[str, Any]
    props: dict[str, Any]
    type: Literal["component"] = "component"

class FileMessage(GradioModel):
    file: FileData
    alt_text: str | None = None
    type: Literal["file"] = "file"
*/

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
