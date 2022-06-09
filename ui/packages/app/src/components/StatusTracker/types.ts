export interface LoadingStatus {
	eta: number;
	queue_position: number;
	status: "pending" | "error" | "complete";
	scroll_to_output: boolean;
	fn_index: number;
}
