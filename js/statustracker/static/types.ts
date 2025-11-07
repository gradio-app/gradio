export interface ILoadingStatus {
	eta: number | null;
	status: "pending" | "error" | "complete" | "generating" | "streaming";
	queue: boolean;
	queue_position: number | null;
	queue_size?: number;
	fn_index: number;
	message?: string | null;
	scroll_to_output?: boolean;
	show_progress?: "full" | "minimal" | "hidden";
	time_limit?: number | null | undefined;
	progress?: {
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}[];
	validation_error?: string | null;
	type: "input" | "output";
	stream_status: "open" | "closed" | "waiting" | null;
}

export interface LoadingStatusArgs {
	fn_index: ILoadingStatus["fn_index"];
	status: ILoadingStatus["status"];
	queue?: ILoadingStatus["queue"];
	size?: ILoadingStatus["queue_size"];
	position?: ILoadingStatus["queue_position"];
	eta?: ILoadingStatus["eta"];
	message?: ILoadingStatus["message"];
	progress?: ILoadingStatus["progress"];
	time_limit?: ILoadingStatus["time_limit"];
	type?: ILoadingStatus["type"];
	stream_status: "open" | "closed" | "waiting" | null;
}

export interface ToastMessage {
	type: "error" | "warning" | "info" | "success";
	title: string;
	message: string;
	id: number;
	duration: number | null;
	visible: boolean;
}

export interface GroupedToastMessage {
	type: "error" | "warning" | "info" | "success";
	messages: ToastMessage[];
	expanded: boolean;
}
