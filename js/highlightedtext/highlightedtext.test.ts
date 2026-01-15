import { test, describe, assert, afterEach } from "vitest";
import { cleanup, fireEvent, render } from "@self/tootils";
import { setupi18n } from "../core/src/i18n";

import HighlightedText from "./Index.svelte";
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
		const { getByText, getAllByText } = await render(HighlightedText, {
			interactive: false,
			loading_status,
			value: [
				{ token: "The", class_or_confidence: null },
				{ token: "quick", class_or_confidence: "adjective" },
				{ token: " sneaky", class_or_confidence: "adjective" },
				{ token: "fox", class_or_confidence: "subject" },
				{ token: " jumped ", class_or_confidence: "past tense verb" },
				{ token: "over the", class_or_confidence: null },
				{ token: "lazy dog", class_or_confidence: "object" }
			]
		});

		const quick = getByText("quick");
		const adjectiveLabels = getAllByText("adjective");

		assert.exists(quick);
		assert.exists(adjectiveLabels);
		assert.equal(adjectiveLabels.length, 2);
	});

	test("renders labels with remove label buttons which trigger change", async () => {
		const { getAllByText, listen } = await render(HighlightedText, {
			interactive: true,
			loading_status,
			value: [
				{ token: "The", class_or_confidence: null },
				{ token: "quick", class_or_confidence: "adjective" },
				{ token: " sneaky", class_or_confidence: "adjective" },
				{ token: "fox", class_or_confidence: "subject" },
				{ token: " jumped ", class_or_confidence: "past tense  verb" },
				{ token: "over the", class_or_confidence: null },
				{ token: "lazy dog", class_or_confidence: "object" }
			]
		});

		const mock = listen("change");

		const removeButtons = getAllByText("×");

		assert.equal(removeButtons.length, 5);

		assert.equal(mock.callCount, 0);

		fireEvent.click(removeButtons[0]);

		assert.equal(mock.callCount, 1);
	});

	describe("Score mode", () => {
		test("renders tokens with numeric confidence scores", async () => {
			const { getByText, getByTestId } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				value: [
					{ token: "good", class_or_confidence: 0.8 },
					{ token: " ", class_or_confidence: 0 },
					{ token: "bad", class_or_confidence: -0.6 }
				]
			});

			const goodToken = getByText("good");
			const badToken = getByText("bad");

			assert.exists(goodToken);
			assert.exists(badToken);

			// Score mode should render the textfield
			const textfield = getByTestId("highlighted-text:textfield");
			assert.exists(textfield);
		});

		test("does not show category labels in score mode", async () => {
			const { queryAllByText } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				value: [
					{ token: "positive", class_or_confidence: 0.5 },
					{ token: "negative", class_or_confidence: -0.5 }
				]
			});

			// In score mode, the numeric values should not be displayed as labels
			const labels = queryAllByText("0.5");
			assert.equal(labels.length, 0);
		});
	});

	describe("Legend", () => {
		test("shows category legend when show_legend is true", async () => {
			const { getByTestId, getByText } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				show_legend: true,
				value: [
					{ token: "Hello", class_or_confidence: "greeting" },
					{ token: "world", class_or_confidence: "noun" }
				]
			});

			const legend = getByTestId("highlighted-text:category-legend");
			assert.exists(legend);

			// Legend should contain category names
			const greetingLegend = getByText("greeting");
			const nounLegend = getByText("noun");
			assert.exists(greetingLegend);
			assert.exists(nounLegend);
		});

		test("shows score legend when show_legend is true in score mode", async () => {
			const { getByTestId } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				show_legend: true,
				value: [
					{ token: "positive", class_or_confidence: 0.8 },
					{ token: "negative", class_or_confidence: -0.5 }
				]
			});

			const legend = getByTestId("highlighted-text:color-legend");
			assert.exists(legend);
		});

		test("hides legend when show_legend is false", async () => {
			const { queryByTestId } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				show_legend: false,
				value: [
					{ token: "Hello", class_or_confidence: "greeting" }
				]
			});

			const legend = queryByTestId("highlighted-text:category-legend");
			assert.isNull(legend);
		});
	});

	describe("Select events", () => {
		test("dispatches select event when clicking highlighted token", async () => {
			const { getByText, listen } = await render(HighlightedText, {
				interactive: true,
				loading_status,
				value: [
					{ token: "clickable", class_or_confidence: "label" }
				]
			});

			const mock = listen("select");
			const token = getByText("clickable");

			await fireEvent.click(token);

			assert.equal(mock.callCount, 1);
			assert.deepEqual(mock.calls[0][0].detail.data, {
				index: 0,
				value: ["clickable", "label"]
			});
		});

		test("dispatches select event in non-interactive mode too", async () => {
			const { getByText, listen } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				value: [
					{ token: "clickable", class_or_confidence: "label" }
				]
			});

			const mock = listen("select");
			const token = getByText("clickable");

			await fireEvent.click(token);

			assert.equal(mock.callCount, 1);
		});
	});

	describe("Interactive editing", () => {
		test("shows label input when clicking on highlighted token in interactive mode", async () => {
			const { getByText, container } = await render(HighlightedText, {
				interactive: true,
				loading_status,
				value: [
					{ token: "editable", class_or_confidence: "original" }
				]
			});

			const token = getByText("editable");
			await fireEvent.click(token);

			// After clicking, an input should appear
			const input = container.querySelector(".label-input");
			assert.exists(input);
		});

		test("updates label value when editing", async () => {
			const { getByText, container, listen } = await render(HighlightedText, {
				interactive: true,
				loading_status,
				value: [
					{ token: "editable", class_or_confidence: "original" }
				]
			});

			const changeMock = listen("change");
			const token = getByText("editable");
			await fireEvent.click(token);

			const input = container.querySelector(".label-input") as HTMLInputElement;
			assert.exists(input);

			// Change the value
			await fireEvent.input(input, { target: { value: "updated" } });
			await fireEvent.blur(input);

			assert.isAbove(changeMock.callCount, 0);
		});

		test("does not show label input in non-interactive mode", async () => {
			const { getByText, container } = await render(HighlightedText, {
				interactive: false,
				loading_status,
				value: [
					{ token: "not-editable", class_or_confidence: "label" }
				]
			});

			const token = getByText("not-editable");
			await fireEvent.click(token);

			const input = container.querySelector(".label-input");
			assert.isNull(input);
		});
	});
});
