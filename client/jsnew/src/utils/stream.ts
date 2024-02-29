export function apply_diff_stream(
	event_id: string,
	data: any,
	pending_diff_streams: Record<string, any[]> = {},
	apply_diff: (a: any, b: any) => any
): void {
	let is_first_generation = !pending_diff_streams[event_id];
	if (is_first_generation) {
		pending_diff_streams[event_id] = [];
		data.data.forEach((value: any, i: number) => {
			pending_diff_streams[event_id][i] = value;
		});
	} else {
		data.data.forEach((value: any, i: number) => {
			let new_data = apply_diff(pending_diff_streams[event_id][i], value);
			pending_diff_streams[event_id][i] = new_data;
			data.data[i] = new_data;
		});
	}
}
