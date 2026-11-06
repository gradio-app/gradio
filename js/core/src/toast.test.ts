import { describe, expect, test } from "vitest";
import { event_toast } from "./toast";

describe("event_toast", () => {
	test("a message gets the event's default title", () => {
		expect(event_toast("warning", "Careful")).toEqual({
			title: "Warning",
			message: "Careful",
			type: "warning",
			duration: 10,
			visible: true
		});
	});

	test("a toast object keeps its own title, duration and visibility", () => {
		expect(
			event_toast("warning", {
				message: "Saved",
				title: "Done",
				duration: null,
				visible: false
			})
		).toEqual({
			title: "Done",
			message: "Saved",
			type: "warning",
			duration: null,
			visible: false
		});
	});

	test("a success toast comes as an info event with its own type", () => {
		expect(event_toast("info", { message: "Saved", type: "success" })).toEqual({
			title: "Success",
			message: "Saved",
			type: "success",
			duration: 10,
			visible: true
		});
	});

	test("an event without data still shows a toast", () => {
		// e.g. gr.Gallery's upload error dispatches "error" with no detail
		expect(event_toast("error", undefined)).toEqual({
			title: "Error",
			message: "",
			type: "error",
			duration: 10,
			visible: true
		});
		expect(event_toast("info", null)?.title).toBe("Info");
	});

	test("other events, including Object.prototype keys, are not toasts", () => {
		expect(event_toast("change", "x")).toBeNull();
		// A component's own "success" event runs its listeners instead
		expect(event_toast("success", "x")).toBeNull();
		expect(event_toast("constructor", "x")).toBeNull();
		expect(event_toast("toString", "x")).toBeNull();
	});
});
