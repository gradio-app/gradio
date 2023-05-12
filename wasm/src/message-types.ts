export interface InMessageBase {
	type: string;
	data: unknown;
}

export interface InMessageInit extends InMessageBase {
	type: "init";
	data: {
		gradioWheelUrl: string;
		gradioClientWheelUrl: string;
		requirements: string[];
	};
}
export interface InMessageEcho extends InMessageBase {
	// For debug
	type: "echo";
	data: unknown;
}

export type InMessage = InMessageInit | InMessageEcho;

export interface ReplyMessageSuccess {
	type: "reply:success";
	data: unknown;
}
export interface ReplyMessageError {
	type: "reply:error";
	error: Error;
}

export type ReplyMessage = ReplyMessageSuccess | ReplyMessageError;
