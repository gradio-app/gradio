import { describe, test, expect } from "vitest";
import { LIBRARY, getComponentForPortType, TASK_SCHEMAS } from "./node-library";
import { PORT_REGISTRY } from "./workflow-modalities";

describe("LIBRARY.components", () => {
	test("has one template per PORT_REGISTRY entry", () => {
		expect(LIBRARY.components.length).toBe(PORT_REGISTRY.length);
	});

	test("each template's port type matches its registry entry", () => {
		for (const meta of PORT_REGISTRY) {
			const tmpl = LIBRARY.components.find((c) => c.label === meta.label);
			expect(tmpl, `no template for ${meta.label}`).toBeTruthy();
			expect(tmpl!.outputs[0]?.type).toBe(meta.port_type);
			expect(tmpl!.inputs[0]?.type).toBe(meta.port_type);
		}
	});

	test("every template has exactly one in and one out port", () => {
		for (const tmpl of LIBRARY.components) {
			expect(tmpl.inputs).toHaveLength(1);
			expect(tmpl.outputs).toHaveLength(1);
		}
	});

	test("number template has compact height, others use standard", () => {
		const number = LIBRARY.components.find((c) => c.label === "Number");
		const image = LIBRARY.components.find((c) => c.label === "Image");
		expect(number?.height).toBe(130);
		expect(image?.height).toBe(160);
	});

	test("all templates are kind=component, source=local", () => {
		for (const tmpl of LIBRARY.components) {
			expect(tmpl.kind).toBe("component");
			expect(tmpl.source).toBe("local");
		}
	});

	test("does not include File or any port templates", () => {
		const types = LIBRARY.components.map((c) => c.outputs[0]?.type);
		expect(types).not.toContain("file");
		expect(types).not.toContain("any");
	});
});

describe("getComponentForPortType", () => {
	test("returns the matching template for a known port type", () => {
		expect(getComponentForPortType("image")?.label).toBe("Image");
		expect(getComponentForPortType("audio")?.label).toBe("Audio");
		expect(getComponentForPortType("text")?.label).toBe("Text");
		expect(getComponentForPortType("number")?.label).toBe("Number");
		expect(getComponentForPortType("model3d")?.label).toBe("3D");
		expect(getComponentForPortType("gallery")?.label).toBe("Gallery");
	});

	test("falls back to Image for inference-only types", () => {
		expect(getComponentForPortType("any")?.label).toBe("Image");
		expect(getComponentForPortType("file")?.label).toBe("Image");
	});

	test("returns null for unknown port types", () => {
		expect(getComponentForPortType("nonsense")).toBeNull();
	});
});

describe("TASK_SCHEMAS", () => {
	test("every entry declares at least one input and one output", () => {
		for (const [tag, schema] of Object.entries(TASK_SCHEMAS)) {
			expect(schema.inputs.length, `${tag} has no inputs`).toBeGreaterThan(0);
			expect(schema.outputs.length, `${tag} has no outputs`).toBeGreaterThan(0);
		}
	});

	test("no schema port uses inference-only fallback types", () => {
		for (const [tag, schema] of Object.entries(TASK_SCHEMAS)) {
			for (const p of [...schema.inputs, ...schema.outputs]) {
				expect(p.type, `${tag}:${p.id} uses fallback type ${p.type}`).not.toBe(
					"any"
				);
				expect(p.type, `${tag}:${p.id} uses fallback type ${p.type}`).not.toBe(
					"file"
				);
			}
		}
	});

	test("port ids and labels are non-empty", () => {
		for (const [tag, schema] of Object.entries(TASK_SCHEMAS)) {
			for (const p of [...schema.inputs, ...schema.outputs]) {
				expect(p.id.length, `${tag} port missing id`).toBeGreaterThan(0);
				expect(p.label.length, `${tag} port missing label`).toBeGreaterThan(0);
			}
		}
	});

	test("known modality alignment: text-to-image outputs image", () => {
		expect(TASK_SCHEMAS["text-to-image"].outputs[0]?.type).toBe("image");
	});

	test("known modality alignment: automatic-speech-recognition outputs text", () => {
		expect(TASK_SCHEMAS["automatic-speech-recognition"].outputs[0]?.type).toBe(
			"text"
		);
	});

	test("known modality alignment: text-to-speech outputs audio", () => {
		expect(TASK_SCHEMAS["text-to-speech"].outputs[0]?.type).toBe("audio");
	});
});
