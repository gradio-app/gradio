// @ts-nocheck
import { ApiData, ApiInfo, Config } from "../types";

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
			type: { continuous: false, generator: false }
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
			type: { continuous: false, generator: false }
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
	version: "4.20.0",
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
			component_class_id: "xyz"
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
	stylesheets: [
		"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap",
		"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap"
	],
	theme: "default",
	protocol: "sse_v2",
	body_css: {
		body_background_fill: "white",
		body_text_color: "#1f2937",
		body_background_fill_dark: "#0b0f19",
		body_text_color_dark: "#f3f4f6"
	},
	fill_height: false,
	layout: {},
	dependencies: [],
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
		current: null,
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
