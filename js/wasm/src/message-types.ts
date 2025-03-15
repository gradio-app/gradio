import type { ASGIScope } from "./asgi-types";
import type { CodeCompletionRequest } from "./webworker/code-completion/index";
import type { PackageData } from "pyodide";

export interface EmscriptenFile {
	data: string | ArrayBufferView;
	opts?: Record<string, string>;
}
export interface EmscriptenFileUrl {
	url: string;
	opts?: Record<string, string>;
}

export interface InMessageBase {
	type: string;
	data: unknown;
}

export interface InMessageInitEnv extends InMessageBase {
	type: "init-env";
	data: {
		gradioWheelUrl: string;
		gradioClientWheelUrl: string;
	};
}
export interface InMessageInitApp extends InMessageBase {
	type: "init-app";
	data: {
		files: Record<string, EmscriptenFile | EmscriptenFileUrl>;
		requirements: string[];
	};
}
export interface InMessageRunPythonCode extends InMessageBase {
	type: "run-python-code";
	data: {
		code: string;
	};
}
export interface InMessageRunPythonFile extends InMessageBase {
	type: "run-python-file";
	data: {
		path: string;
	};
}
export interface InMessageAsgiRequest extends InMessageBase {
	type: "asgi-request";
	data: {
		scope: ASGIScope;
	};
}
export interface InMessageFileWrite extends InMessageBase {
	type: "file:write";
	data: {
		path: string;
		data: string | ArrayBufferView;
		opts?: Record<string, any>;
	};
}
export interface InMessageFileRename extends InMessageBase {
	type: "file:rename";
	data: {
		oldPath: string;
		newPath: string;
	};
}
export interface InMessageFileUnlink extends InMessageBase {
	type: "file:unlink";
	data: {
		path: string;
	};
}
export interface InMessageInstall extends InMessageBase {
	type: "install";
	data: {
		requirements: string[];
	};
}
export interface InMessageCodeCompletion extends InMessageBase {
	type: "code-completion";
	data: CodeCompletionRequest;
}

export interface InMessageEcho extends InMessageBase {
	// For debug
	type: "echo";
	data: unknown;
}

export type InMessage =
	| InMessageInitEnv
	| InMessageInitApp
	| InMessageRunPythonCode
	| InMessageRunPythonFile
	| InMessageAsgiRequest
	| InMessageFileWrite
	| InMessageFileRename
	| InMessageFileUnlink
	| InMessageInstall
	| InMessageCodeCompletion
	| InMessageEcho;

export interface ReplyMessageSuccess<T = unknown> {
	type: "reply:success";
	data: T;
}
export interface ReplyMessageError {
	type: "reply:error";
	error: Error;
}

export type ReplyMessage = ReplyMessageSuccess | ReplyMessageError;

export interface OutMessageBase {
	type: string;
	data: unknown;
}
export interface OutMessageProgressUpdate extends OutMessageBase {
	type: "progress-update";
	data: {
		log: string;
	};
}
export interface OutMessageModulesAutoLoaded extends OutMessageBase {
	type: "modules-auto-loaded";
	data: {
		packages: PackageData[];
	};
}
export interface OutMessageStdout extends OutMessageBase {
	type: "stdout";
	data: {
		output: string;
	};
}
export interface OutMessageStderr extends OutMessageBase {
	type: "stderr";
	data: {
		output: string;
	};
}
export interface OutMessagePythonError extends OutMessageBase {
	type: "python-error";
	data: {
		traceback: string;
	};
}
export type OutMessage =
	| OutMessageProgressUpdate
	| OutMessageModulesAutoLoaded
	| OutMessageStdout
	| OutMessageStderr
	| OutMessagePythonError;
