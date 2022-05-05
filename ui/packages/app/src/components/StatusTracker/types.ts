export interface LoadingStatus {
	eta: number;
	queue_position: number;
	status: "pending" | "error" | "complete";
}
