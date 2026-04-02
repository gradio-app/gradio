import { test, describe, expect, afterEach } from "vitest";
import { mount, unmount, tick } from "svelte";
import StatusTracker from "./static/index.svelte";

describe("StatusTracker: should_hide with validation errors", () => {
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

	test("wrap does not have .hide when validation_error is present", async () => {
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

		const wrap = target.querySelector("[data-testid='status-tracker']");
		expect(wrap).not.toBeNull();
		expect(wrap!.classList.contains("hide")).toBe(false);
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

		const errorEl = target.querySelector(".validation-error");
		expect(errorEl).not.toBeNull();
		expect(errorEl!.textContent).toContain("Can't be error");
	});

	test("wrap has .hide when status is null and no validation error", async () => {
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

		const wrap = target.querySelector("[data-testid='status-tracker']");
		expect(wrap).not.toBeNull();
		expect(wrap!.classList.contains("hide")).toBe(true);
	});

	test("validation error stays visible even when status is undefined (simulating update_state_cb replacement)", async () => {
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

		const wrap = target.querySelector("[data-testid='status-tracker']");
		expect(wrap!.classList.contains("hide")).toBe(false);

		const errorEl = target.querySelector(".validation-error");
		expect(errorEl!.textContent).toContain("Error message");
	});

	test("wrap has .hide when show_validation_error is false even with validation_error", async () => {
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

		const wrap = target.querySelector("[data-testid='status-tracker']");
		expect(wrap!.classList.contains("hide")).toBe(true);
	});
});
