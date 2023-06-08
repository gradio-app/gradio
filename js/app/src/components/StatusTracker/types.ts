export interface LoadingStatus {
	eta: number;
	queue_position: number;
	queue_size: number;
	status: "pending" | "error" | "complete";
	show_progress: "full" | "minimal" | "hidden";
	scroll_to_output: boolean;
	visible: boolean;
	fn_index: number;
	message?: string;
	progress?: Array<{
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}>;
}
