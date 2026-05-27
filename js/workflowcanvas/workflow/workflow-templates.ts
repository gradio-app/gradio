import type { Workflow } from "./workflow-types";

export const TEMPLATES: {
	name: string;
	desc: string;
	build: () => Workflow;
}[] = [
	{
		name: "not-lain/background-removal",
		desc: "Image → background removal → clean image",
		build: () => ({
			version: "1",
			name: "not-lain/background-removal",
			nodes: [
				{
					id: "t1",
					kind: "input",
					label: "Image",
					source: "local",
					inputs: [],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 80,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				},
				{
					id: "t2",
					kind: "transform",
					label: "Remove background",
					source: "space",
					space_id: "not-lain/background-removal",
					endpoint: "/image",
					inputs: [{ id: "in", label: "Image", type: "image", required: true }],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 420,
					y: 120,
					width: 200,
					height: 90,
					data: {}
				},
				{
					id: "t3",
					kind: "output",
					label: "Image",
					source: "local",
					inputs: [{ id: "in", label: "Image", type: "image" }],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 740,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				}
			],
			edges: [
				{
					id: "e1",
					from_node_id: "t1",
					from_port_id: "out",
					to_node_id: "t2",
					to_port_id: "in",
					type: "image"
				},
				{
					id: "e2",
					from_node_id: "t2",
					from_port_id: "out",
					to_node_id: "t3",
					to_port_id: "in",
					type: "image"
				}
			]
		})
	},
	{
		name: "black-forest-labs/FLUX.1-schnell",
		desc: "Prompt → FLUX → generated image",
		build: () => ({
			version: "1",
			name: "black-forest-labs/FLUX.1-schnell",
			nodes: [
				{
					id: "t1",
					kind: "input",
					label: "Textbox",
					source: "local",
					inputs: [],
					outputs: [{ id: "out", label: "Text", type: "text" }],
					x: 80,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				},
				{
					id: "t2",
					kind: "transform",
					label: "Generate image",
					source: "space",
					space_id: "black-forest-labs/FLUX.1-schnell",
					inputs: [{ id: "in", label: "Prompt", type: "text", required: true }],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 420,
					y: 120,
					width: 200,
					height: 90,
					data: {}
				},
				{
					id: "t3",
					kind: "output",
					label: "Image",
					source: "local",
					inputs: [{ id: "in", label: "Image", type: "image" }],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 740,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				}
			],
			edges: [
				{
					id: "e1",
					from_node_id: "t1",
					from_port_id: "out",
					to_node_id: "t2",
					to_port_id: "in",
					type: "text"
				},
				{
					id: "e2",
					from_node_id: "t2",
					from_port_id: "out",
					to_node_id: "t3",
					to_port_id: "in",
					type: "image"
				}
			]
		})
	},
	{
		name: "hf-audio/whisper-large-v3-turbo",
		desc: "Audio → Whisper → transcript text",
		build: () => ({
			version: "1",
			name: "hf-audio/whisper-large-v3-turbo",
			nodes: [
				{
					id: "t1",
					kind: "input",
					label: "Audio",
					source: "local",
					inputs: [],
					outputs: [{ id: "out", label: "Audio", type: "audio" }],
					x: 80,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				},
				{
					id: "t2",
					kind: "transform",
					label: "Transcribe",
					source: "space",
					space_id: "hf-audio/whisper-large-v3-turbo",
					inputs: [{ id: "in", label: "Audio", type: "audio", required: true }],
					outputs: [{ id: "out", label: "Text", type: "text" }],
					x: 420,
					y: 120,
					width: 200,
					height: 90,
					data: {}
				},
				{
					id: "t3",
					kind: "output",
					label: "Textbox",
					source: "local",
					inputs: [{ id: "in", label: "Text", type: "text" }],
					outputs: [{ id: "out", label: "Text", type: "text" }],
					x: 740,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				}
			],
			edges: [
				{
					id: "e1",
					from_node_id: "t1",
					from_port_id: "out",
					to_node_id: "t2",
					to_port_id: "in",
					type: "audio"
				},
				{
					id: "e2",
					from_node_id: "t2",
					from_port_id: "out",
					to_node_id: "t3",
					to_port_id: "in",
					type: "text"
				}
			]
		})
	},
	{
		name: "vikhyatk/moondream1",
		desc: "Image → caption → text description",
		build: () => ({
			version: "1",
			name: "vikhyatk/moondream1",
			nodes: [
				{
					id: "t1",
					kind: "input",
					label: "Image",
					source: "local",
					inputs: [],
					outputs: [{ id: "out", label: "Image", type: "image" }],
					x: 80,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				},
				{
					id: "t2",
					kind: "transform",
					label: "Describe image",
					source: "space",
					space_id: "vikhyatk/moondream1",
					inputs: [{ id: "in", label: "Image", type: "image", required: true }],
					outputs: [{ id: "out", label: "Caption", type: "text" }],
					x: 420,
					y: 120,
					width: 200,
					height: 90,
					data: {}
				},
				{
					id: "t3",
					kind: "output",
					label: "Textbox",
					source: "local",
					inputs: [{ id: "in", label: "Text", type: "text" }],
					outputs: [{ id: "out", label: "Text", type: "text" }],
					x: 740,
					y: 120,
					width: 220,
					height: 160,
					data: {}
				}
			],
			edges: [
				{
					id: "e1",
					from_node_id: "t1",
					from_port_id: "out",
					to_node_id: "t2",
					to_port_id: "in",
					type: "image"
				},
				{
					id: "e2",
					from_node_id: "t2",
					from_port_id: "out",
					to_node_id: "t3",
					to_port_id: "in",
					type: "text"
				}
			]
		})
	}
];
