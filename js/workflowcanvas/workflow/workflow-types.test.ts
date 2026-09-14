import { describe, test, expect } from "vitest";
import { widget_type_for, ports_compatible } from "./workflow-types";
import { mime_for } from "./workflow-executor";

describe("widget_type_for", () => {
	test("a declared type that means something is kept", () => {
		// Only ambiguous declarations get second-guessed: a text port holding a
		// media-shaped object is a bug upstream, not a reason to render an image.
		expect(widget_type_for("text", "hello")).toBe("text");
		expect(widget_type_for("markdown", "# hi")).toBe("markdown");
		expect(widget_type_for("image", { url: "x", mime: "image/png" })).toBe(
			"image"
		);
		expect(widget_type_for("number", 3)).toBe("number");
	});

	test("ambiguous declarations follow the value's shape", () => {
		// `any` matched no branch in NodeWidget at all, so a tile rendered
		// nothing — no value, no placeholder — which reads exactly like a model
		// that returned nothing. space-api gives `any` to every port of a Space
		// whose schema it can't read, so this is the common case, not an edge.
		expect(widget_type_for("any", "an answer")).toBe("text");
		expect(widget_type_for("any", 42)).toBe("number");
		expect(widget_type_for("any", true)).toBe("boolean");
		expect(widget_type_for("json", "plain string")).toBe("text");
	});

	test("media MIMEs still win over a JSON blob", () => {
		expect(widget_type_for("any", { url: "u", mime: "image/png" })).toBe(
			"image"
		);
		expect(widget_type_for("file", { url: "u", mime: "audio/wav" })).toBe(
			"audio"
		);
		expect(widget_type_for("json", { url: "u", mime: "video/mp4" })).toBe(
			"video"
		);
	});

	test("anything unrecognisable still lands on a renderable type", () => {
		// The point of the change: never return a type with no branch.
		expect(widget_type_for("any", null)).toBe("json");
		expect(widget_type_for("any", undefined)).toBe("json");
		expect(widget_type_for("any", [1, 2, 3])).toBe("json");
		expect(widget_type_for("any", { not: "a file" })).toBe("json");
		// A file port with no value keeps its picker rather than becoming text.
		expect(widget_type_for("file", null)).toBe("file");
	});

	test("markdown and text stay interchangeable for wiring", () => {
		expect(ports_compatible("markdown", "text")).toBe(true);
		expect(ports_compatible("text", "image")).toBe(false);
	});
});

describe("mime_for", () => {
	test("the URL's extension wins over the port type", () => {
		// A PNG on an `any` port used to be labelled video/mp4, because the
		// guess was made from the port type and everything that wasn't image or
		// audio fell through to video.
		expect(mime_for("/gradio_api/file=/tmp/workflow_ab.png", "any")).toBe(
			"image/png"
		);
		expect(mime_for("https://x/y/out.wav", "json")).toBe("audio/wav");
		expect(mime_for("https://x/y/clip.webm", "file")).toBe("video/webm");
		expect(mime_for("https://x/y/a.png?token=1", "any")).toBe("image/png");
	});

	test("the port type is the fallback, not the authority", () => {
		expect(mime_for("https://x/y/noext", "image")).toBe("image/png");
		expect(mime_for("https://x/y/noext", "audio")).toBe("audio/wav");
		expect(mime_for("https://x/y/noext", "video")).toBe("video/mp4");
	});

	test("null when neither source knows", () => {
		// The caller keeps the string as-is rather than dressing it up as a
		// file whose type it can't identify.
		expect(mime_for("https://x/y/noext", "any")).toBeNull();
		expect(mime_for("https://x/y/noext", "json")).toBeNull();
	});
});
