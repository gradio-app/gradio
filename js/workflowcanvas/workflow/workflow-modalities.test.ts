import { describe, test, expect } from "vitest";
import type { PortType } from "./workflow-types";
import {
	MODALITIES,
	DATASET_MODALITY,
	MODEL_MODALITY,
	PORT_REGISTRY,
	portMeta,
	modalityForPort
} from "./workflow-modalities";

describe("ModalityConfig.port_type", () => {
	test("every picker modality declares a canonical port type", () => {
		for (const m of MODALITIES) {
			expect(
				m.port_type,
				`modality ${m.key} missing port_type`
			).not.toBeUndefined();
		}
	});

	test("each modality's port_type round-trips through modalityForPort", () => {
		for (const m of MODALITIES) {
			if (!m.port_type) continue;
			const reverse = modalityForPort(m.port_type);
			expect(
				reverse?.key,
				`port ${m.port_type} did not resolve back to ${m.key}`
			).toBe(m.key);
		}
	});

	test("dataset + model meta modalities have no canonical port type", () => {
		expect(DATASET_MODALITY.port_type).toBeNull();
		expect(MODEL_MODALITY.port_type).toBeNull();
	});

	test("known modality → port_type mapping", () => {
		const byKey = Object.fromEntries(
			MODALITIES.map((m) => [m.key, m.port_type])
		);
		expect(byKey.image).toBe("image");
		expect(byKey.audio).toBe("audio");
		expect(byKey.video).toBe("video");
		expect(byKey["3d"]).toBe("model3d");
		expect(byKey.text).toBe("text");
	});
});

describe("PORT_REGISTRY", () => {
	test("contains every user-facing port type", () => {
		const expected: PortType[] = [
			"image",
			"audio",
			"video",
			"model3d",
			"text",
			"number",
			"boolean",
			"json",
			"gallery"
		];
		for (const t of expected) {
			expect(
				PORT_REGISTRY.find((p) => p.port_type === t),
				`registry missing ${t}`
			).toBeTruthy();
		}
	});

	test("excludes inference-only fallbacks (any, file)", () => {
		expect(PORT_REGISTRY.find((p) => p.port_type === "any")).toBeUndefined();
		expect(PORT_REGISTRY.find((p) => p.port_type === "file")).toBeUndefined();
	});

	test("every entry has a non-empty label", () => {
		for (const p of PORT_REGISTRY) {
			expect(p.label.length, `${p.port_type} has empty label`).toBeGreaterThan(
				0
			);
		}
	});

	test("each entry's modality_key (if set) points at an existing modality", () => {
		for (const p of PORT_REGISTRY) {
			if (!p.modality_key) continue;
			expect(
				MODALITIES.find((m) => m.key === p.modality_key),
				`port ${p.port_type} references unknown modality ${p.modality_key}`
			).toBeTruthy();
		}
	});

	test("port types are unique", () => {
		const types = PORT_REGISTRY.map((p) => p.port_type);
		expect(new Set(types).size).toBe(types.length);
	});
});

describe("portMeta", () => {
	test("returns the registry entry for a known port type", () => {
		expect(portMeta("image")?.label).toBe("Image");
		expect(portMeta("text")?.label).toBe("Text");
		expect(portMeta("number")?.label).toBe("Number");
		expect(portMeta("boolean")?.label).toBe("Toggle");
		expect(portMeta("model3d")?.label).toBe("3D");
	});

	test("returns null for inference-only fallback types", () => {
		expect(portMeta("any")).toBeNull();
		expect(portMeta("file")).toBeNull();
	});
});

describe("modalityForPort", () => {
	test("routes media types to their picker modality", () => {
		expect(modalityForPort("image")?.key).toBe("image");
		expect(modalityForPort("audio")?.key).toBe("audio");
		expect(modalityForPort("video")?.key).toBe("video");
		expect(modalityForPort("model3d")?.key).toBe("3d");
		expect(modalityForPort("text")?.key).toBe("text");
	});

	test("gallery routes to the image modality", () => {
		expect(modalityForPort("gallery")?.key).toBe("image");
	});

	test("scalar types do not map to a picker modality", () => {
		expect(modalityForPort("number")).toBeNull();
		expect(modalityForPort("boolean")).toBeNull();
		expect(modalityForPort("json")).toBeNull();
	});

	test("inference-only fallbacks have no modality", () => {
		expect(modalityForPort("any")).toBeNull();
		expect(modalityForPort("file")).toBeNull();
	});
});
