import { describe, test, expect, vi } from "vitest";
import { executeWorkflow } from "./workflow-executor";
import type {
	OperatorNode,
	NodeDataValue,
	NodeStatus,
	ReferenceNode,
	WFEdge,
	Workflow
} from "./workflow-types";

function emptyV2(
	operators: OperatorNode[] = [],
	references: ReferenceNode[] = [],
	edges: WFEdge[] = []
): Workflow {
	return {
		schema_version: "2",
		name: "Test",
		runtime: { default: "client" },
		references,
		operators,
		subjects: [],
		edges,
		view: { default: "canvas" }
	};
}

function statusBag(): {
	onStatus: (id: string, s: NodeStatus, err?: string) => void;
	statuses: Record<string, NodeStatus>;
	errors: Record<string, string>;
} {
	const statuses: Record<string, NodeStatus> = {};
	const errors: Record<string, string> = {};
	return {
		onStatus: (id, s, err) => {
			statuses[id] = s;
			if (err) errors[id] = err;
		},
		statuses,
		errors
	};
}

describe("executeWorkflow — dataset row_index input port", () => {
	function datasetOpWithRowIndex(
		id: string,
		overrides: Partial<OperatorNode> = {}
	): OperatorNode {
		return {
			id,
			role: "operator",
			kind: "dataset",
			label: "ds",
			dataset_id: "user/dataset",
			dataset_config: "default",
			dataset_split: "train",
			inputs: [
				{
					id: "row_index",
					label: "Row",
					type: "number",
					default_value: 0
				}
			],
			outputs: [{ id: "out_0", label: "value", type: "text" }],
			data: {},
			x: 0,
			y: 0,
			width: 240,
			height: 90,
			runtime: "client",
			...overrides
		};
	}

	test("uses inline data value when row_index is unwired", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		const op = datasetOpWithRowIndex("d1", { data: { row_index: 11 } });

		await executeWorkflow(
			emptyV2([op]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("11");
	});

	test("falls back to port default_value when neither edge nor inline data is set", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		// Default value on the port itself; no data, no edge.
		const op = datasetOpWithRowIndex("d1", {
			inputs: [
				{
					id: "row_index",
					label: "Row",
					type: "number",
					default_value: 6
				}
			]
		});

		await executeWorkflow(
			emptyV2([op]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("6");
	});

	test("reads from upstream when row_index is wired", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		const ref: ReferenceNode = {
			id: "r1",
			role: "reference",
			label: "Number",
			asset_type: "number",
			inputs: [{ id: "in", label: "n", type: "number" }],
			outputs: [{ id: "out", label: "n", type: "number" }],
			data: { in: 9 },
			x: 0,
			y: 0,
			width: 200,
			height: 130
		};
		const op = datasetOpWithRowIndex("d1");
		const edge: WFEdge = {
			id: "e1",
			from_node_id: "r1",
			from_port_id: "in",
			to_node_id: "d1",
			to_port_id: "row_index",
			type: "number"
		};

		await executeWorkflow(
			emptyV2([op], [ref], [edge]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("9");
	});

	test("coerces string numerics from upstream", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		const op = datasetOpWithRowIndex("d1", {
			data: { row_index: "14" as unknown as NodeDataValue }
		});

		await executeWorkflow(
			emptyV2([op]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("14");
	});

	test("falls back to offset 0 when the row_index port has no value", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		const op = datasetOpWithRowIndex("d1", {
			inputs: [{ id: "row_index", label: "Row", type: "number" }]
		});

		await executeWorkflow(
			emptyV2([op]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("0");
	});

	test("negative row indices clamp to 0", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		await executeWorkflow(
			emptyV2([datasetOpWithRowIndex("d1", { data: { row_index: -42 } })]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("0");
	});

	test("fractional indices truncate", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		await executeWorkflow(
			emptyV2([datasetOpWithRowIndex("d1", { data: { row_index: 3.7 } })]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][3]).toBe("3");
	});

	test("passes dataset_config and dataset_split through verbatim", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "x" }] }));

		await executeWorkflow(
			emptyV2([
				datasetOpWithRowIndex("d1", {
					dataset_config: "subset_a",
					dataset_split: "test"
				})
			]),
			() => {},
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(fetchStub.mock.calls[0][1]).toBe("subset_a");
		expect(fetchStub.mock.calls[0][2]).toBe("test");
	});

	test("marks status error when fetch returns an error blob", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ error: "boom" }));
		const { onStatus, statuses, errors } = statusBag();

		await executeWorkflow(
			emptyV2([datasetOpWithRowIndex("d1")]),
			onStatus,
			() => {},
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(statuses.d1).toBe("error");
		expect(errors.d1).toBe("boom");
	});

	test("emits output by matching the row column to the port label", async () => {
		const fetchStub = vi
			.fn()
			.mockResolvedValue(JSON.stringify({ rows: [{ value: "hello" }] }));
		const onOutput = vi.fn();

		await executeWorkflow(
			emptyV2([datasetOpWithRowIndex("d1")]),
			() => {},
			onOutput,
			undefined,
			undefined,
			undefined,
			fetchStub as unknown as Parameters<typeof executeWorkflow>[6]
		);

		expect(onOutput).toHaveBeenCalledWith("d1", "out_0", "hello");
	});
});

describe("executeWorkflow — model operator routing", () => {
	function modelOp(
		id: string,
		overrides: Partial<OperatorNode> = {}
	): OperatorNode {
		return {
			id,
			role: "operator",
			kind: "model",
			label: "m",
			model_id: "user/m",
			pipeline_tag: "text-generation",
			inputs: [
				{
					id: "in_0",
					label: "Prompt",
					type: "text",
					default_value: "hello"
				}
			],
			outputs: [{ id: "out_0", label: "Text", type: "text" }],
			data: {},
			x: 0,
			y: 0,
			width: 280,
			height: 90,
			runtime: "client",
			...overrides
		};
	}

	test("passes node.provider through to serverCallModel", async () => {
		const callModel = vi
			.fn()
			.mockResolvedValue(JSON.stringify(["fake-output"]));

		await executeWorkflow(
			emptyV2([
				modelOp("m1", { provider: "together", pipeline_tag: "summarization" })
			]),
			() => {},
			() => {},
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined
		);

		// (modelId, pipelineTag, argsJson, provider)
		expect(callModel).toHaveBeenCalledTimes(1);
		expect(callModel.mock.calls[0][0]).toBe("user/m");
		expect(callModel.mock.calls[0][1]).toBe("summarization");
		expect(callModel.mock.calls[0][3]).toBe("together");
	});

	test("provider stays undefined when the node doesn't declare one", async () => {
		const callModel = vi.fn().mockResolvedValue(JSON.stringify(["fake"]));

		await executeWorkflow(
			emptyV2([modelOp("m1", { pipeline_tag: "summarization" })]),
			() => {},
			() => {},
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined
		);

		expect(callModel.mock.calls[0][3]).toBeUndefined();
	});

	test("text-generation routes through stream_text_generation when provided", async () => {
		const streamFn = vi
			.fn()
			.mockImplementation(
				async (_modelId, _prompt, _provider, _signal, onChunk) => {
					onChunk("hel", "hel");
					onChunk("lo", "hello");
					return "hello";
				}
			);
		const callModel = vi.fn();
		const onOutput = vi.fn();

		await executeWorkflow(
			emptyV2([modelOp("m1", { pipeline_tag: "text-generation" })]),
			() => {},
			onOutput,
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined,
			streamFn as unknown as Parameters<typeof executeWorkflow>[8]
		);

		expect(callModel).not.toHaveBeenCalled();
		expect(streamFn).toHaveBeenCalledTimes(1);
		// emits accumulated text per chunk to the output port
		expect(onOutput).toHaveBeenNthCalledWith(1, "m1", "out_0", "hel");
		expect(onOutput).toHaveBeenNthCalledWith(2, "m1", "out_0", "hello");
	});

	test("non-streamable text tasks still use serverCallModel even when stream fn is provided", async () => {
		const streamFn = vi.fn();
		const callModel = vi.fn().mockResolvedValue(JSON.stringify(["summary"]));

		await executeWorkflow(
			emptyV2([modelOp("m1", { pipeline_tag: "summarization" })]),
			() => {},
			() => {},
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined,
			streamFn as unknown as Parameters<typeof executeWorkflow>[8]
		);

		expect(streamFn).not.toHaveBeenCalled();
		expect(callModel).toHaveBeenCalledTimes(1);
	});

	test("falls back to serverCallModel for text-generation when no stream fn is provided", async () => {
		const callModel = vi
			.fn()
			.mockResolvedValue(JSON.stringify(["fallback text"]));

		await executeWorkflow(
			emptyV2([modelOp("m1", { pipeline_tag: "text-generation" })]),
			() => {},
			() => {},
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined
			// no stream fn
		);

		expect(callModel).toHaveBeenCalledTimes(1);
	});

	test("passes the streaming model id + provider to the stream fn", async () => {
		const streamFn = vi.fn().mockResolvedValue("done");
		const callModel = vi.fn();

		await executeWorkflow(
			emptyV2([
				modelOp("m1", {
					pipeline_tag: "text-generation",
					provider: "together"
				})
			]),
			() => {},
			() => {},
			undefined,
			undefined,
			callModel as unknown as Parameters<typeof executeWorkflow>[5],
			undefined,
			undefined,
			streamFn as unknown as Parameters<typeof executeWorkflow>[8]
		);

		const [modelId, prompt, provider] = streamFn.mock.calls[0];
		expect(modelId).toBe("user/m");
		expect(prompt).toBe("hello");
		expect(provider).toBe("together");
	});
});
