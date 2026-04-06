import { test, describe, expect, afterEach } from "vitest";
import { mount, unmount, tick } from "svelte";
import { within } from "@self/tootils/render";
import StatusTracker from "./static/index.svelte";

describe("StatusTracker: validation errors", () => {
	let target: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	const base_props = {
		i18n: (s: string | null | undefined) => s ?? "",
		autoscroll: false,
		queue_position: null,
		queue_size: null
	};

	afterEach(() => {
		if (component) {
			unmount(component);
		}
		if (target) {
			target.remove();
		}
	});

	test("component is visible when validation_error is present", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: null,
				validation_error: "This field is required",
				show_validation_error: true
			}
		});
		await tick();

		const { getByTestId } = within(target);
		expect(getByTestId("status-tracker")).toBeVisible();
	});

	test("validation error text is rendered and visible", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: null,
				validation_error: "Can't be error",
				show_validation_error: true
			}
		});
		await tick();

		const { getByText } = within(target);
		expect(getByText("Can't be error")).toBeVisible();
	});

	test("component is hidden when status is null and no validation error", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: null,
				validation_error: null,
				show_validation_error: true
			}
		});
		await tick();

		const { getByTestId } = within(target);
		expect(getByTestId("status-tracker")).not.toBeVisible();
	});

	test("validation error stays visible when status is undefined", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: undefined as any,
				validation_error: "Error message",
				show_validation_error: true
			}
		});
		await tick();

		const { getByTestId, getByText } = within(target);
		expect(getByTestId("status-tracker")).toBeVisible();
		expect(getByText("Error message")).toBeVisible();
	});

	test("component is hidden when show_validation_error is false even with validation_error", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: null,
				validation_error: "Error message",
				show_validation_error: false
			}
		});
		await tick();

		const { getByTestId } = within(target);
		expect(getByTestId("status-tracker")).not.toBeVisible();
	});

	test("cache indicator only appears on outputs", async () => {
		target = document.createElement("div");
		document.body.appendChild(target);

		component = mount(StatusTracker, {
			target,
			props: {
				...base_props,
				status: "complete",
				type: "input",
				used_cache: "partial",
				cache_duration: 0.1,
				avg_time: 1
			}
		});
		await tick();

		const { queryByText } = within(target);
		expect(queryByText("used cache")).toBeNull();
		expect(queryByText("from cache")).toBeNull();
	});
});
