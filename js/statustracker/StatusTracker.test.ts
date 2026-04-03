import { test, describe, expect, afterEach } from "vitest";
import { mount, unmount, tick } from "svelte";
import { getQueriesForElement, fireEvent } from "@self/tootils/render";
import StatusTracker from "./static/index.svelte";

const i18n = (s: string | null | undefined): string => s ?? "";

const base_props = {
	i18n,
	autoscroll: false,
	queue_position: null,
	queue_size: null
};

// Helper to mount StatusTracker and return testing-library queries.
// StatusTracker is a raw Svelte sub-component (not Gradio-wrapped),
// so we use mount() directly instead of the tootils render() utility.
function mount_tracker(
	props: Record<string, any>
): ReturnType<typeof getQueriesForElement> & {
	container: HTMLDivElement;
	cleanup: () => void;
} {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const component = mount(StatusTracker, {
		target: container,
		props: { ...base_props, ...props }
	});
	const queries = getQueriesForElement(container);
	return {
		container,
		...queries,
		cleanup: () => {
			unmount(component);
			container.remove();
		}
	};
}

let tracker: ReturnType<typeof mount_tracker>;

afterEach(() => {
	tracker?.cleanup();
});

describe("StatusTracker: validation errors", () => {
	test("validation error is visible when present and show_validation_error=true", async () => {
		tracker = mount_tracker({
			status: null,
			validation_error: "This field is required",
			show_validation_error: true
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
		expect(tracker.getByText("This field is required")).toBeVisible();
	});

	test("validation error text content is rendered correctly", async () => {
		tracker = mount_tracker({
			status: null,
			validation_error: "Can't be empty",
			show_validation_error: true
		});
		await tick();

		expect(tracker.getByText("Can't be empty")).toBeVisible();
	});

	test("tracker is hidden when status is null and no validation error", async () => {
		tracker = mount_tracker({
			status: null,
			validation_error: null,
			show_validation_error: true
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});

	test("validation error stays visible even when status is undefined", async () => {
		tracker = mount_tracker({
			status: undefined as any,
			validation_error: "Error message",
			show_validation_error: true
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
		expect(tracker.getByText("Error message")).toBeVisible();
	});

	test("tracker is hidden when show_validation_error=false even with validation_error", async () => {
		tracker = mount_tracker({
			status: null,
			validation_error: "Error message",
			show_validation_error: false
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});

	test("validation error clear button dismisses the error", async () => {
		tracker = mount_tracker({
			status: null,
			validation_error: "Some error",
			show_validation_error: true
		});
		await tick();

		expect(tracker.getByText("Some error")).toBeVisible();

		// The clear button inside the validation error
		const clearBtn = tracker.getByLabelText("common.clear");
		await fireEvent.click(clearBtn);

		// After clearing, the validation error text should be gone
		expect(tracker.queryByText("Some error")).toBeNull();
	});
});

describe("StatusTracker: status states", () => {
	test("tracker is hidden when status is 'complete'", async () => {
		tracker = mount_tracker({
			status: "complete",
			validation_error: null,
			show_validation_error: true
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});

	test("tracker is visible when status is 'pending'", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_validation_error: true,
			show_progress: "full"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
	});

	test("tracker is visible when status is 'error'", async () => {
		tracker = mount_tracker({
			status: "error",
			validation_error: null,
			show_validation_error: true,
			show_progress: "full"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
	});

	test("error status shows error text", async () => {
		tracker = mount_tracker({
			status: "error",
			validation_error: null,
			show_validation_error: true
		});
		await tick();

		expect(tracker.getByText("common.error")).toBeVisible();
	});

	test("tracker is hidden when status is 'streaming'", async () => {
		tracker = mount_tracker({
			status: "streaming",
			validation_error: null,
			show_validation_error: true
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});

	test("tracker is not hidden when status is 'generating' with full progress", async () => {
		tracker = mount_tracker({
			status: "generating",
			validation_error: null,
			show_validation_error: true,
			show_progress: "full"
		});
		await tick();

		// The 'generating' state is NOT hidden (should_hide=false),
		// but its CSS animation (pulseStart) begins at opacity:0,
		// so toBeVisible() is unreliable here. Instead verify the
		// element is in the DOM and the hide class is absent.
		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeTruthy();
		expect(wrapper.classList.contains("hide")).toBe(false);
	});

	test("tracker is hidden when type is 'input' regardless of status", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_validation_error: true,
			type: "input"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});
});

describe("StatusTracker: pending state UI", () => {
	test("pending status shows timer by default", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full",
			timer: true
		});
		await tick();

		// Timer shows formatted time ending in 's'
		expect(tracker.getByText(/\d+\.\d+s/)).toBeVisible();
	});

	test("pending status with timer=false shows loading text", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full",
			timer: false,
			loading_text: "Please wait..."
		});
		await tick();

		expect(tracker.getByText("Please wait...")).toBeVisible();
	});

	test("pending status shows queue position", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full",
			queue_position: 2,
			queue_size: 5
		});
		await tick();

		// queue displays position+1/size
		expect(tracker.getByText(/queue: 3\/5/)).toBeVisible();
	});

	test("pending status with progress shows progress percentage", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full",
			progress: [{ progress: 0.5, index: null, length: null, unit: null, desc: null }]
		});
		await tick();

		expect(tracker.getByText(/50\.0%/)).toBeVisible();
	});

	test("pending status with index/length progress shows counts", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full",
			progress: [
				{ progress: null, index: 3, length: 10, unit: "steps", desc: null }
			]
		});
		await tick();

		expect(tracker.getByText(/3\/10/)).toBeVisible();
		expect(tracker.getByText(/steps/)).toBeVisible();
	});
});

describe("StatusTracker: show_progress modes", () => {
	test("show_progress='hidden' hides tracker even when pending", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "hidden"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).not.toBeVisible();
	});

	test("show_progress='full' shows tracker when pending", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "full"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
	});

	test("show_progress='minimal' shows tracker when pending", async () => {
		tracker = mount_tracker({
			status: "pending",
			validation_error: null,
			show_progress: "minimal"
		});
		await tick();

		const wrapper = tracker.getByTestId("status-tracker");
		expect(wrapper).toBeVisible();
	});
});
