export interface WorkflowTemplate {
	id: string;
	name: string;
	category: string;
	description: string;
	accent: string;
	gradient: string;
	workflow: Record<string, unknown>;
}

const TEXT_TO_IMAGE: Record<string, unknown> = {
	schema_version: "2",
	name: "Text to Image",
	runtime: { default: "client" },
	references: [
		{
			id: "ref-prompt",
			label: "Prompt",
			role: "reference",
			asset_type: "text",
			inputs: [{ id: "in", label: "Text", type: "text" }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 220,
			height: 163,
			x: 100,
			y: 120,
			data: { in: null }
		}
	],
	operators: [
		{
			id: "op-flux",
			label: "Generate Image",
			role: "operator",
			kind: "space",
			source: "hf://spaces/multimodalart/FLUX.1-merged",
			space_id: "multimodalart/FLUX.1-merged",
			runtime: "client",
			inputs: [{ id: "in", label: "Prompt", type: "text", required: true }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 124,
			x: 400,
			y: 120,
			data: {},
			endpoints: [
				{
					name: "/infer",
					inputs: [
						{ id: "in_0", label: "Prompt", type: "text", required: true },
						{ id: "in_1", label: "Seed", type: "number", required: false },
						{
							id: "in_2",
							label: "Randomize seed",
							type: "boolean",
							required: false
						},
						{ id: "in_3", label: "Width", type: "number", required: false },
						{ id: "in_4", label: "Height", type: "number", required: false },
						{
							id: "in_5",
							label: "Guidance Scale",
							type: "number",
							required: false
						},
						{
							id: "in_6",
							label: "Number of inference steps",
							type: "number",
							required: false
						}
					],
					outputs: [
						{ id: "out_0", label: "Result", type: "image", output_index: 0 },
						{ id: "out_1", label: "Seed", type: "number", output_index: 1 }
					]
				}
			]
		}
	],
	subjects: [
		{
			id: "subj-output",
			label: "Generated Image",
			role: "subject",
			asset_type: "image",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 107,
			x: 700,
			y: 120,
			data: { in: null }
		}
	],
	edges: [
		{
			id: "e1",
			from_node_id: "ref-prompt",
			from_port_id: "out",
			to_node_id: "op-flux",
			to_port_id: "in",
			type: "text"
		},
		{
			id: "e2",
			from_node_id: "op-flux",
			from_port_id: "out",
			to_node_id: "subj-output",
			to_port_id: "in",
			type: "image"
		}
	]
};

const IMAGE_CAPTIONING: Record<string, unknown> = {
	schema_version: "2",
	name: "Image Captioning",
	runtime: { default: "client" },
	references: [
		{
			id: "ref-image",
			label: "Image",
			role: "reference",
			asset_type: "image",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 124,
			x: 100,
			y: 120,
			data: {}
		}
	],
	operators: [
		{
			id: "op-caption",
			label: "Describe Image",
			role: "operator",
			kind: "space",
			source: "hf://spaces/ovi054/image-to-prompt",
			space_id: "ovi054/image-to-prompt",
			endpoint: "/predict",
			runtime: "client",
			pipeline_tag: "Image Captioning",
			inputs: [
				{ id: "in_0", label: "Input Image", type: "image", required: true }
			],
			outputs: [
				{
					id: "out_0",
					label: "Output Prompt",
					type: "text",
					output_index: 0
				}
			],
			width: 280,
			height: 124,
			x: 400,
			y: 120,
			data: {},
			endpoints: [
				{
					name: "/predict",
					inputs: [
						{
							id: "in_0",
							label: "Input Image",
							type: "image",
							required: true
						}
					],
					outputs: [
						{
							id: "out_0",
							label: "Output Prompt",
							type: "text",
							output_index: 0
						}
					]
				}
			]
		}
	],
	subjects: [
		{
			id: "subj-caption",
			label: "Caption",
			role: "subject",
			asset_type: "text",
			inputs: [{ id: "in", label: "Text", type: "text" }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 220,
			height: 163,
			x: 760,
			y: 120,
			data: { in: null }
		}
	],
	edges: [
		{
			id: "e1",
			from_node_id: "ref-image",
			from_port_id: "out",
			to_node_id: "op-caption",
			to_port_id: "in_0",
			type: "image"
		},
		{
			id: "e2",
			from_node_id: "op-caption",
			from_port_id: "out_0",
			to_node_id: "subj-caption",
			to_port_id: "in",
			type: "text"
		}
	]
};

const MARKETING_IMAGE: Record<string, unknown> = {
	schema_version: "2",
	name: "Marketing Image Creator",
	runtime: { default: "client" },
	references: [
		{
			label: "Text",
			inputs: [{ id: "in", label: "Text", type: "text" }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 220,
			height: 163,
			asset_type: "text",
			role: "reference",
			id: "1539a1e9-4906-4008-b345-e6d05bb69b22",
			x: 740,
			y: 80,
			data: { in: null }
		},
		{
			label: "Image",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 124,
			asset_type: "image",
			role: "reference",
			id: "13e92b22-7173-416c-81c6-1ca097a2a299",
			x: 80,
			y: 80,
			data: {}
		}
	],
	operators: [
		{
			id: "n_flux",
			label: "Generate Image",
			inputs: [{ id: "in", label: "Prompt", type: "text", required: true }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			data: {},
			x: 1040,
			y: 80,
			width: 220,
			height: 124,
			role: "operator",
			kind: "space",
			source: "hf://spaces/multimodalart/FLUX.1-merged",
			space_id: "multimodalart/FLUX.1-merged",
			runtime: "client",
			endpoints: [
				{
					name: "/infer",
					inputs: [
						{ id: "in_0", label: "Prompt", type: "text", required: true },
						{ id: "in_1", label: "Seed", type: "number", required: false },
						{
							id: "in_2",
							label: "Randomize seed",
							type: "boolean",
							required: false
						},
						{ id: "in_3", label: "Width", type: "number", required: false },
						{ id: "in_4", label: "Height", type: "number", required: false },
						{
							id: "in_5",
							label: "Guidance Scale",
							type: "number",
							required: false
						},
						{
							id: "in_6",
							label: "Number of inference steps",
							type: "number",
							required: false
						}
					],
					outputs: [
						{ id: "out_0", label: "Result", type: "image", output_index: 0 },
						{ id: "out_1", label: "Seed", type: "number", output_index: 1 }
					]
				}
			]
		},
		{
			label: "Image To Prompt",
			inputs: [
				{ id: "in_0", label: "Input Image", type: "image", required: true }
			],
			outputs: [
				{
					id: "out_0",
					label: "Output Prompt",
					type: "text",
					output_index: 0
				}
			],
			width: 280,
			height: 124,
			kind: "space",
			space_id: "ovi054/image-to-prompt",
			endpoint: "/predict",
			endpoints: [
				{
					name: "/predict",
					inputs: [
						{
							id: "in_0",
							label: "Input Image",
							type: "image",
							required: true
						}
					],
					outputs: [
						{
							id: "out_0",
							label: "Output Prompt",
							type: "text",
							output_index: 0
						}
					]
				}
			],
			pipeline_tag: "Image Captioning",
			role: "operator",
			id: "897592dc-17b5-473b-9e89-4ebdae4073d6",
			x: 380,
			y: 80,
			data: {}
		}
	],
	subjects: [
		{
			id: "n_output",
			label: "Marketing Image",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			data: { in: null },
			x: 1340,
			y: 80,
			width: 220,
			height: 107,
			role: "subject",
			asset_type: "image"
		}
	],
	edges: [
		{
			id: "e4",
			from_node_id: "n_flux",
			from_port_id: "out",
			to_node_id: "n_output",
			to_port_id: "in",
			type: "image"
		},
		{
			from_node_id: "1539a1e9-4906-4008-b345-e6d05bb69b22",
			from_port_id: "out",
			to_node_id: "n_flux",
			to_port_id: "in",
			type: "text",
			id: "b44e83fe-23b1-4dcc-83d3-55b3481721bc"
		},
		{
			from_node_id: "13e92b22-7173-416c-81c6-1ca097a2a299",
			from_port_id: "out",
			to_node_id: "897592dc-17b5-473b-9e89-4ebdae4073d6",
			to_port_id: "in_0",
			type: "image",
			id: "22796709-ff7d-4250-92c0-2d541f9e6a99"
		},
		{
			from_node_id: "897592dc-17b5-473b-9e89-4ebdae4073d6",
			from_port_id: "out_0",
			to_node_id: "1539a1e9-4906-4008-b345-e6d05bb69b22",
			to_port_id: "in",
			type: "text",
			id: "96dab823-0f2c-4356-98c4-aa82feca5e0a"
		}
	]
};

export const TEMPLATES: WorkflowTemplate[] = [
	{
		id: "text-to-image",
		name: "Text to Image",
		category: "Image Generation",
		description: "Generate images from a text prompt using FLUX",
		accent: "#4fd1a5",
		gradient:
			"radial-gradient(ellipse at 15% 85%, #2dd4bf 0%, #0d9488 40%, transparent 70%), radial-gradient(ellipse at 80% 10%, #38bdf8 0%, #0284c7 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #059669 0%, transparent 60%), #0d766e",
		workflow: TEXT_TO_IMAGE
	},
	{
		id: "image-captioning",
		name: "Image Captioning",
		category: "Vision",
		description: "Describe any image with AI",
		accent: "#8b83e8",
		gradient:
			"radial-gradient(ellipse at 15% 85%, #a78bfa 0%, #7c3aed 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #818cf8 0%, #4f46e5 45%, transparent 70%), radial-gradient(ellipse at 50% 55%, #6d28d9 0%, transparent 60%), #4c1d95",
		workflow: IMAGE_CAPTIONING
	},
	{
		id: "marketing-image",
		name: "Marketing Image Creator",
		category: "Creative",
		description: "Turn a product photo into marketing copy and a new visual",
		accent: "#f97316",
		gradient:
			"radial-gradient(ellipse at 10% 85%, #fb923c 0%, #ea580c 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #f43f5e 0%, #be123c 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #dc2626 0%, transparent 60%), #9a3412",
		workflow: MARKETING_IMAGE
	}
];
