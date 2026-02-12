import { test, describe, assert, afterEach, beforeEach } from "vitest";
import { tick, mount, unmount } from "svelte";

import BaseForm from "./BaseForm.svelte";

describe("BaseForm Accessibility", () => {
	let target: HTMLElement;
	let component: any;

	beforeEach(() => {
		target = document.body.appendChild(document.createElement("div"));
	});

	afterEach(() => {
		if (component) {
			unmount(component);
		}
		if (target.parentNode) {
			target.parentNode.removeChild(target);
		}
	});

	test("renders without role='group' by default", async () => {
		component = mount(BaseForm, {
			target,
			props: {
				visible: true,
				scale: 1,
				min_width: 0
			}
		});
		await tick();
		const form = target.querySelector(".form");
		assert.isNull(form?.getAttribute("role"));
	});

	test("renders with aria-label when label prop is provided", async () => {
		component = mount(BaseForm, {
			target,
			props: {
				visible: true,
				scale: 1,
				min_width: 0,
				label: "Form Section"
			}
		});
		await tick();
		const form = target.querySelector(".form");
		assert.equal(form?.getAttribute("aria-label"), "Form Section");
		assert.equal(form?.getAttribute("role"), "group");
	});

	test("renders without aria-label when label is not provided", async () => {
		component = mount(BaseForm, {
			target,
			props: {
				visible: true,
				scale: 1,
				min_width: 0
			}
		});
		await tick();
		const form = target.querySelector(".form");
		assert.isNull(form?.getAttribute("aria-label"));
	});
});
