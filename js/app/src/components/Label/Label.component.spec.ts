import { test, expect } from "@playwright/experimental-ct-svelte";
import type { Page, Locator } from "@playwright/test";
import Label from "./Label.svelte";
import { spy } from "tinyspy";

import type { LoadingStatus } from "../StatusTracker/types";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

test("gr.Label default value and label rendered with confidences", async ({
	mount,
	page
}) => {
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.9 },
					{ label: "Bad", confidence: 0.1 }
				]
			},
			label: "My Label",
			show_label: true,
			loading_status: loading_status
		}
	});
	await expect(component).toContainText("My Label");
	await expect(component.getByTestId("block-label")).toBeVisible();
	await expect(page.getByTestId("label-output-value")).toContainText("Good");
	await expect(page.getByTestId("Good-confidence-set")).toContainText("90");
	await expect(page.getByTestId("Bad-confidence-set")).toContainText("10");
});

test("gr.Label hides label when show_label=false", async ({ mount, page }) => {
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.9 },
					{ label: "Bad", confidence: 0.1 }
				]
			},
			label: "My Label",
			show_label: false,
			loading_status: loading_status
		}
	});
	await expect(component.getByTestId("block-label")).toBeHidden();
});

test("gr.Label confidence bars not rendered without confidences", async ({
	mount
}) => {
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good"
			},
			label: "My Label",
			show_label: true,
			loading_status: loading_status
		}
	});
	await expect(component).toContainText("My Label");
	expect(await component.getByTestId("Good-confidence-set").count()).toEqual(0);
});

test("gr.Label confidence bars trigger select event when clicked", async ({
	mount,
	page
}) => {
	const select = spy();
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.9 },
					{ label: "Bad", confidence: 0.1 }
				]
			},
			label: "My Label",
			show_label: true,
			loading_status: loading_status
		},
		on: {
			select: select
		}
	});
	await expect(component).toContainText("My Label");
	await component.getByTestId("Bad-confidence-set").click();
	expect(select.callCount).toEqual(1);
	expect(select.calls[0][0]).toEqual({ index: 1, value: "Bad" });
});

test("gr.Label triggers change event", async ({ mount, page }) => {
	const change = spy();
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.9 },
					{ label: "Bad", confidence: 0.1 }
				]
			},
			label: "My Label",
			show_label: true,
			loading_status: loading_status
		},
		on: {
			change: change
		}
	});
	await component.update({
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.1 },
					{ label: "Bad", confidence: 0.9 }
				]
			}
		}
	});
	expect(change.callCount).toEqual(1);
});
