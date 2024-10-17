export interface LoadingStatus {
	eta: number;
	queue_position: number;
	queue_size: number;
	status: "pending" | "error" | "complete" | "generating" | "streaming";
	show_progress: "full" | "minimal" | "hidden";
	scroll_to_output: boolean;
	visible: boolean;
	fn_index: number;
	message?: string;
	progress?: {
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}[];
	time_limit?: number | null;
}

export interface ToastMessage {
	type: "error" | "warning" | "info";
	title: string;
	message: string;
	id: number;
	duration: number | null;
	visible: boolean;
}
