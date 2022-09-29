export interface LoadingStatus {
	eta: number;
	queue_position: number;
	queue_size: number;
	status: "pending" | "error" | "complete";
	scroll_to_output: boolean;
	visible: boolean;
	fn_index: number;
	message: string | null;
}
