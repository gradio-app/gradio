// @ts-nocheck
import { ApiData, ApiInfo, Config, EndpointInfo } from "../types";

export const runtime_response = {
	stage: "RUNNING",
	hardware: {
		current: "cpu-basic",
		requested: "cpu-basic"
	},
	storage: {
		current: null,
		requested: null
	},
	gcTimeout: 86400,
	replicas: {
		current: 1,
		requested: 1
	},
	devMode: false,
	domains: [
		{
			domain: "hmb-hello-world.hf.space",
			isCustom: false,
			stage: "READY"
		}
	]
};

export const transformed_api_info: ApiInfo<ApiData> = {
	named_endpoints: {
		"/predict": {
			parameters: [
				{
					label: "name",
					type: "string",
					python_type: { type: "str", description: "" },
					component: "Textbox",
					example_input: "Hello!!"
				}
			],
			returns: [
				{
					label: "output",
					type: "string",
					python_type: { type: "str", description: "" },
					component: "Textbox"
				}
			],
			type: { generator: false, cancel: false }
		}
	},
	unnamed_endpoints: {
		"0": {
			parameters: [
				{
					label: "name",
					type: "string",
					python_type: { type: "str", description: "" },
					component: "Textbox",
					example_input: "Hello!!"
				}
			],
			returns: [
				{
					label: "output",
					type: "string",
					python_type: { type: "str", description: "" },
					component: "Textbox"
				}
			],
			type: { generator: false, cancel: false }
		}
	}
};

export const response_api_info: ApiInfo<ApiData> = {
	named_endpoints: {
		"/predict": {
			parameters: [
				{
					label: "name",
					type: {
						type: "string"
					},
					python_type: {
						type: "str",
						description: ""
					},
					component: "Textbox",
					example_input: "Hello!!"
				}
			],
			returns: [
				{
					label: "output",
					type: {
						type: "string"
					},
					python_type: {
						type: "str",
						description: ""
					},
					component: "Textbox"
				}
			]
		}
	},
	unnamed_endpoints: {}
};

export const config_response: Config = {
	version: "4.27.0",
	mode: "interface",
	app_id: 123,
	dev_mode: false,
	analytics_enabled: true,
	components: [
		{
			id: 3,
			type: "row",
			props: {
				variant: "default",
				visible: true,
				equal_height: false,
				name: "row"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 4,
			type: "column",
			props: {
				scale: 1,
				min_width: 320,
				variant: "panel",
				visible: true,
				name: "column"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 5,
			type: "column",
			props: {
				scale: 1,
				min_width: 320,
				variant: "default",
				visible: true,
				name: "column"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 1,
			type: "textbox",
			props: {
				lines: 1,
				max_lines: 20,
				label: "name",
				show_label: true,
				container: true,
				min_width: 160,
				visible: true,
				autofocus: false,
				autoscroll: true,
				elem_classes: [],
				type: "text",
				rtl: false,
				show_copy_button: false,
				name: "textbox",
				_selectable: false
			},
			skip_api: false,
			component_class_id: "",
			api_info: {
				type: "string"
			},
			example_inputs: "Hello!!"
		},
		{
			id: 6,
			type: "form",
			props: {
				scale: 0,
				min_width: 0,
				name: "form"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 7,
			type: "row",
			props: {
				variant: "default",
				visible: true,
				equal_height: true,
				name: "row"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 8,
			type: "button",
			props: {
				value: "Clear",
				variant: "secondary",
				visible: true,
				interactive: true,
				elem_classes: [],
				show_api: false,
				name: "button",
				_selectable: false
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 9,
			type: "button",
			props: {
				value: "Submit",
				variant: "primary",
				visible: true,
				interactive: true,
				elem_classes: [],
				name: "button",
				_selectable: false
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 10,
			type: "column",
			props: {
				scale: 1,
				min_width: 320,
				variant: "panel",
				visible: true,
				name: "column"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 2,
			type: "textbox",
			props: {
				lines: 1,
				max_lines: 20,
				label: "output",
				show_label: true,
				container: true,
				min_width: 160,
				interactive: false,
				visible: true,
				autofocus: false,
				autoscroll: true,
				elem_classes: [],
				type: "text",
				rtl: false,
				show_copy_button: false,
				name: "textbox",
				_selectable: false
			},
			skip_api: false,
			component_class_id: "",
			api_info: {
				type: "string"
			},
			example_inputs: "Hello!!"
		},
		{
			id: 11,
			type: "row",
			props: {
				variant: "default",
				visible: true,
				equal_height: true,
				name: "row"
			},
			skip_api: true,
			component_class_id: ""
		},
		{
			id: 12,
			type: "form",
			props: {
				scale: 0,
				min_width: 0,
				name: "form"
			},
			skip_api: true,
			component_class_id: ""
		}
	],
	css: null,
	js: null,
	head: null,
	title: "Gradio",
	space_id: "hmb/hello_world",
	enable_queue: true,
	show_error: false,
	show_api: true,
	is_colab: false,
	stylesheets: [],
	theme: "default",
	protocol: "sse_v3",
	body_css: {
		body_background_fill: "white",
		body_text_color: "#1f2937",
		body_background_fill_dark: "#0b0f19",
		body_text_color_dark: "#f3f4f6"
	},
	fill_height: false,
	layout: {
		id: 0,
		children: [
			{
				id: 3,
				children: [
					{
						id: 4,
						children: [
							{
								id: 5,
								children: [
									{
										id: 6,
										children: [
											{
												id: 1
											}
										]
									}
								]
							},
							{
								id: 7,
								children: [
									{
										id: 8
									},
									{
										id: 9
									}
								]
							}
						]
					},
					{
						id: 10,
						children: [
							{
								id: 12,
								children: [
									{
										id: 2
									}
								]
							},
							{
								id: 11,
								children: []
							}
						]
					}
				]
			}
		]
	},
	dependencies: [
		{
			id: 0,
			targets: [
				[9, "click"],
				[1, "submit"]
			],
			inputs: [1],
			outputs: [2],
			backend_fn: true,
			js: null,
			queue: null,
			api_name: "predict",
			scroll_to_output: false,
			show_progress: "full",
			every: null,
			batch: false,
			max_batch_size: 4,
			cancels: [],
			types: {
				generator: false,
				cancel: false
			},
			collects_event_data: false,
			trigger_after: null,
			trigger_only_on_success: false,
			trigger_mode: "once",
			show_api: true,
			zerogpu: false
		},
		{
			id: 1,
			targets: [[8, "click"]],
			inputs: [],
			outputs: [1, 2],
			backend_fn: false,
			js: "() => [null, null]",
			queue: false,
			api_name: "js_fn",
			scroll_to_output: false,
			show_progress: "full",
			every: null,
			batch: false,
			max_batch_size: 4,
			cancels: [],
			types: {
				generator: false,
				cancel: false
			},
			collects_event_data: false,
			trigger_after: null,
			trigger_only_on_success: false,
			trigger_mode: "once",
			show_api: false,
			zerogpu: false
		},
		{
			id: 2,
			targets: [[8, "click"]],
			inputs: [],
			outputs: [5],
			backend_fn: false,
			js: '() => [{"variant": null, "visible": true, "__type__": "update"}]\n            ',
			queue: false,
			api_name: "js_fn_1",
			scroll_to_output: false,
			show_progress: "full",
			every: null,
			batch: false,
			max_batch_size: 4,
			cancels: [],
			types: {
				generator: false,
				cancel: false
			},
			collects_event_data: false,
			trigger_after: null,
			trigger_only_on_success: false,
			trigger_mode: "once",
			show_api: false,
			zerogpu: false
		}
	],
	root: "https://hmb-hello-world.hf.space",
	path: ""
};

export const whoami_response = {
	type: "user",
	id: "123",
	name: "hmb",
	fullname: "jerry",
	email: "jerry@gradio.com",
	emailVerified: true,
	canPay: true,
	periodEnd: 123,
	isPro: false,
	avatarUrl: "",
	orgs: [],
	auth: {
		type: "access_token",
		accessToken: {
			displayName: "Gradio Client",
			role: "write"
		}
	}
};

export const duplicate_response = {
	url: "https://huggingface.co/spaces/hmb/hello_world"
};

export const hardware_sleeptime_response = {
	stage: "RUNNING",
	hardware: {
		current: "cpu-basic",
		requested: "cpu-upgrade"
	},
	storage: null,
	gcTimeout: 300,
	replicas: {
		current: 1,
		requested: 1
	},
	devMode: false,
	domains: [
		{
			domain: "hmb-hello-world.hf.space",
			isCustom: false,
			stage: "READY"
		}
	]
};

export const endpoint_info: EndpointInfo<ApiData> = {
	parameters: [
		{
			label: "parameter_2",
			parameter_name: "im",
			parameter_has_default: false,
			parameter_default: null,
			type: "",
			python_type: {
				type: "Dict(background: filepath | None, layers: List[filepath], composite: filepath | None, id: str | None)",
				description: ""
			},
			component: "Imageeditor",
			example_input: {
				background: {
					path: "",
					meta: {
						_type: "gradio.FileData"
					},
					orig_name: "bus.png",
					url: ""
				},
				layers: [],
				composite: null
			}
		}
	],
	returns: [
		{
			label: "value_3",
			type: "string",
			python_type: {
				type: "filepath",
				description: ""
			},
			component: "Image"
		}
	],
	type: {
		generator: false
	}
};

export const discussions_response = {
	discussions: [],
	count: 0,
	start: 0,
	numClosedDiscussions: 0
};
