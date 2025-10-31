import type { LoadingStatus } from "@gradio/statustracker";

export interface SliderEvents {
	change: never;
	input: never;
	release: number;
	clear_status: LoadingStatus;
}

export interface SliderProps {
	value: number;
	minimum: number;
	maximum: number;
	step: number;
	buttons: string[] | null;
	info: string | undefined;
}

const x = {
	msg: "process_completed",
	event_id: "c2983c5d1319405db54885df3bc1687c",
	output: {
		data: [null],
		is_generating: false,
		duration: 0.005094766616821289,
		average_duration: 0.004999428987503052,
		render_config: {
			page: {
				"": {
					layout: {
						id: 0,
						children: [{ id: 12, children: [{ id: 11 }, { id: 16 }] }]
					},
					components: [2, 11, 12, 16],
					dependencies: [4, 5, 6]
				}
			},
			components: [
				{
					id: 2,
					type: "column",
					props: {
						scale: 1,
						min_width: 320,
						variant: "default",
						visible: true,
						show_progress: true,
						preserved_by_key: [],
						name: "column"
					},
					skip_api: true,
					component_class_id:
						"f803772470db31e5ac202610f892d038780c003d2d1d52beca2ddc3624412c3a",
					key: null,
					renderable: 0
				},
				{
					id: 11,
					type: "textbox",
					props: {
						type: "text",
						lines: 1,
						label: "Box 0",
						show_label: true,
						container: true,
						min_width: 160,
						visible: true,
						autofocus: false,
						autoscroll: true,
						elem_classes: [],
						key: 0,
						preserved_by_key: ["value"],
						rtl: false,
						show_copy_button: false,
						submit_btn: false,
						stop_btn: false,
						name: "textbox",
						_selectable: false
					},
					skip_api: false,
					component_class_id:
						"ff901c8e9b3a86545df2fdbb5e2a71aae51eb58a8f4f36e95e4118a86e78226e",
					key: -8458139203682520985,
					renderable: 0,
					rendered_in: 0,
					api_info: { type: "string" },
					api_info_as_input: { type: "string" },
					api_info_as_output: { type: "string" },
					example_inputs: "Hello!!"
				},
				{
					id: 12,
					type: "form",
					props: {
						scale: 0,
						min_width: 0,
						key: [0, "_parent"],
						preserved_by_key: [],
						name: "form"
					},
					skip_api: true,
					component_class_id:
						"de273ca023b6302aa71929bfa6a3093777d88085309e3550c4dfcf4084dc5573",
					key: 7302678886924402269,
					renderable: 0
				},
				{
					id: 16,
					type: "textbox",
					props: {
						type: "text",
						lines: 1,
						label: "Box 1",
						show_label: true,
						container: true,
						min_width: 160,
						visible: true,
						autofocus: false,
						autoscroll: true,
						elem_classes: [],
						key: 1,
						preserved_by_key: ["value"],
						rtl: false,
						show_copy_button: false,
						submit_btn: false,
						stop_btn: false,
						name: "textbox",
						_selectable: false
					},
					skip_api: false,
					component_class_id:
						"ff901c8e9b3a86545df2fdbb5e2a71aae51eb58a8f4f36e95e4118a86e78226e",
					key: -1950498447580522560,
					renderable: 0,
					rendered_in: 0,
					api_info: { type: "string" },
					api_info_as_input: { type: "string" },
					api_info_as_output: { type: "string" },
					example_inputs: "Hello!!"
				}
			],
			dependencies: [
				{
					id: 4,
					targets: [[4, "click"]],
					inputs: [11, 16],
					outputs: [7],
					backend_fn: true,
					js: null,
					queue: true,
					api_name: "merge_1",
					api_description: null,
					scroll_to_output: false,
					show_progress: "full",
					show_progress_on: null,
					batch: false,
					max_batch_size: 4,
					cancels: [],
					types: { generator: false, cancel: false },
					collects_event_data: false,
					trigger_after: null,
					trigger_only_on_success: false,
					trigger_only_on_failure: false,
					trigger_mode: "once",
					show_api: true,
					rendered_in: 0,
					render_id: null,
					connection: "sse",
					time_limit: null,
					stream_every: 0.5,
					like_user_message: false,
					event_specific_args: null,
					js_implementation: null
				},
				{
					id: 5,
					targets: [[5, "click"]],
					inputs: [],
					outputs: [11, 16],
					backend_fn: true,
					js: null,
					queue: true,
					api_name: "clear_1",
					api_description: null,
					scroll_to_output: false,
					show_progress: "full",
					show_progress_on: null,
					batch: false,
					max_batch_size: 4,
					cancels: [],
					types: { generator: false, cancel: false },
					collects_event_data: false,
					trigger_after: null,
					trigger_only_on_success: false,
					trigger_only_on_failure: false,
					trigger_mode: "once",
					show_api: true,
					rendered_in: 0,
					render_id: null,
					connection: "sse",
					time_limit: null,
					stream_every: 0.5,
					like_user_message: false,
					event_specific_args: null,
					js_implementation: null
				},
				{
					id: 6,
					targets: [[6, "click"]],
					inputs: [],
					outputs: [11, 16],
					backend_fn: true,
					js: null,
					queue: false,
					api_name: "countup_1",
					api_description: null,
					scroll_to_output: false,
					show_progress: "full",
					show_progress_on: null,
					batch: false,
					max_batch_size: 4,
					cancels: [],
					types: { generator: false, cancel: false },
					collects_event_data: false,
					trigger_after: null,
					trigger_only_on_success: false,
					trigger_only_on_failure: false,
					trigger_mode: "once",
					show_api: true,
					rendered_in: 0,
					render_id: null,
					connection: "sse",
					time_limit: null,
					stream_every: 0.5,
					like_user_message: false,
					event_specific_args: null,
					js_implementation: null
				}
			],
			layout: {
				id: 2,
				children: [{ id: 12, children: [{ id: 11 }, { id: 16 }] }]
			},
			render_id: 0
		},
		changed_state_ids: []
	},
	success: true,
	title: null
};
