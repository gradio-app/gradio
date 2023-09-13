import { test, describe, assert, afterEach } from "vitest";
import { cleanup, fireEvent, render } from "@gradio/tootils";
import { setupi18n } from "../app/src/i18n";

import HighlightedText from "./interactive";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

describe("HighlightedText", () => {
	afterEach(() => cleanup());

	setupi18n();

	test("renders provided text and labels", async () => {
		const { getByText, getByTestId, getAllByText } = await render(
			HighlightedText,
			{
				loading_status,
				value: [
					["The", null],
					["quick", "adjective"],
					[" sneaky", "adjective"],
					["fox", "subject"],
					[" jumped ", "past tense verb"],
					["over the", null],
					["lazy dog", "object"]
				]
			}
		);

		const quick = getByText("quick");
		const adjectiveLabels = getAllByText("adjective");

		assert.exists(quick);
		assert.exists(adjectiveLabels);
		assert.equal(adjectiveLabels.length, 2);
	});

	test("renders labels with remove label buttons which trigger change", async () => {
		const { getAllByText, listen } = await render(HighlightedText, {
			loading_status,
			value: [
				["The", null],
				["quick", "adjective"],
				[" sneaky", "adjective"],
				["fox", "subject"],
				[" jumped ", "past tense verb"],
				["over the", null],
				["lazy dog", "object"]
			]
		});

		const mock = listen("change");

		const removeButtons = getAllByText("×");

		assert.equal(removeButtons.length, 5);

		assert.equal(mock.callCount, 0);

		fireEvent.click(removeButtons[0]);

		assert.equal(mock.callCount, 1);
	});
});
