import { describe, test, expect } from "vitest";
import {
	canonicalizePort,
	normalizeOperatorPorts,
	normalize_space_id
} from "./space-api";
import { MODALITIES } from "./workflow-modalities";
import type { Port } from "./workflow-types";

const imageModality = MODALITIES.find((m) => m.key === "image")!;
const audioModality = MODALITIES.find((m) => m.key === "audio")!;
const textModality = MODALITIES.find((m) => m.key === "text")!;

describe("canonicalizePort", () => {
	test("passes through already-specific types regardless of hint", () => {
		expect(canonicalizePort("text", "image")).toBe("text");
		expect(canonicalizePort("audio")).toBe("audio");
		expect(canonicalizePort("image", "image")).toBe("image");
	});

	test("falls back unchanged when no hint is supplied", () => {
		expect(canonicalizePort("any")).toBe("any");
		expect(canonicalizePort("file")).toBe("file");
	});

	test("clamps `any` to the modality canonical type derived from a hint", () => {
		expect(canonicalizePort("any", "image")).toBe("image");
		expect(canonicalizePort("any", "audio")).toBe("audio");
		expect(canonicalizePort("any", "model3d")).toBe("model3d");
	});

	test("clamps `file` similarly", () => {
		expect(canonicalizePort("file", "video")).toBe("video");
		expect(canonicalizePort("file", "text")).toBe("text");
	});

	test("leaves fallback unchanged when the hint has no picker modality", () => {
		expect(canonicalizePort("any", "number")).toBe("any");
		expect(canonicalizePort("file", "boolean")).toBe("file");
		expect(canonicalizePort("any", "json")).toBe("any");
	});
});

describe("normalizeOperatorPorts", () => {
	test("returns the same ports when modality is null", () => {
		const ports: Port[] = [{ id: "in", label: "Input", type: "any" }];
		expect(normalizeOperatorPorts(null, ports)).toEqual(ports);
	});

	test("returns the same ports when modality has no canonical port_type", () => {
		const dataset = MODALITIES.find((m) => m.key === "image")!;
		// data / model modalities have port_type: null — simulate with a stub
		const noopModality = { ...dataset, port_type: null };
		const ports: Port[] = [{ id: "in", label: "Input", type: "any" }];
		expect(normalizeOperatorPorts(noopModality, ports)).toEqual(ports);
	});

	test("clamps `any` and `file` to the modality canonical type", () => {
		const ports: Port[] = [
			{ id: "in", label: "Input A", type: "any" },
			{ id: "out", label: "Output", type: "file" }
		];
		const result = normalizeOperatorPorts(imageModality, ports);
		expect(result[0].type).toBe("image");
		expect(result[1].type).toBe("image");
	});

	test("does not touch already-specific ports", () => {
		const ports: Port[] = [
			{ id: "in", label: "Prompt", type: "text" },
			{ id: "out", label: "Image", type: "image" }
		];
		const result = normalizeOperatorPorts(audioModality, ports);
		expect(result[0].type).toBe("text");
		expect(result[1].type).toBe("image");
	});

	test("preserves other port fields (id, label, required, default_value)", () => {
		const ports: Port[] = [
			{
				id: "in_0",
				label: "Prompt",
				type: "any",
				required: true,
				default_value: "hello"
			}
		];
		const [out] = normalizeOperatorPorts(textModality, ports);
		expect(out.id).toBe("in_0");
		expect(out.label).toBe("Prompt");
		expect(out.required).toBe(true);
		expect(out.default_value).toBe("hello");
		expect(out.type).toBe("text");
	});

	test("returns a new array (does not mutate input)", () => {
		const ports: Port[] = [{ id: "in", label: "x", type: "any" }];
		const result = normalizeOperatorPorts(imageModality, ports);
		expect(result).not.toBe(ports);
		expect(ports[0].type).toBe("any");
	});
});

describe("normalize_space_id", () => {
	test("passes through bare owner/repo", () => {
		expect(normalize_space_id("owner/repo")).toBe("owner/repo");
	});

	test("accepts owner/repo with hyphens, dots, underscores", () => {
		expect(normalize_space_id("JacobLinCool/audio-super-resolution")).toBe(
			"JacobLinCool/audio-super-resolution"
		);
		expect(normalize_space_id("gradio_app/v1.2-test")).toBe(
			"gradio_app/v1.2-test"
		);
	});

	test("parses huggingface.co/spaces/ URLs", () => {
		expect(normalize_space_id("https://huggingface.co/spaces/owner/repo")).toBe(
			"owner/repo"
		);
	});

	test("parses URLs with trailing paths", () => {
		expect(
			normalize_space_id(
				"https://huggingface.co/spaces/owner/repo/discussions/3"
			)
		).toBe("owner/repo");
	});

	test("parses URLs with www subdomain", () => {
		expect(
			normalize_space_id("https://www.huggingface.co/spaces/owner/repo")
		).toBe("owner/repo");
	});

	test("parses *.hf.space subdomains", () => {
		expect(normalize_space_id("https://owner-repo.hf.space")).toBe(
			"owner/repo"
		);
	});

	test("hf.space subdomain with multi-hyphen repo names", () => {
		// Heuristic: first hyphen splits owner/repo. Imperfect but matches HF's actual subdomain format.
		expect(normalize_space_id("https://owner-some-repo-name.hf.space")).toBe(
			"owner/some-repo-name"
		);
	});

	test("trims trailing slashes", () => {
		expect(
			normalize_space_id("https://huggingface.co/spaces/owner/repo/")
		).toBe("owner/repo");
		expect(normalize_space_id("owner/repo/")).toBe("owner/repo");
	});

	test("trims whitespace", () => {
		expect(normalize_space_id("  owner/repo  ")).toBe("owner/repo");
	});

	test("returns null for empty input", () => {
		expect(normalize_space_id("")).toBeNull();
		expect(normalize_space_id("   ")).toBeNull();
	});

	test("returns null for unrecognisable input", () => {
		expect(normalize_space_id("just-a-name")).toBeNull();
		expect(normalize_space_id("https://example.com/foo")).toBeNull();
	});

	test("returns null for too-many-slashes plain input", () => {
		// A plain "a/b/c" isn't an HF Space ID (HF Spaces are owner/repo only).
		expect(normalize_space_id("a/b/c")).toBeNull();
	});
});
