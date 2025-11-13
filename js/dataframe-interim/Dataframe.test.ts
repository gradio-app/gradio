import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@self/tootils";
import { setupi18n } from "../core/src/i18n";
import Dataframe from "./Index.svelte";

describe("Dataframe", () => {
	beforeEach(setupi18n);
	afterEach(() => {
		cleanup();
	});

	test("changing value triggers change event", async () => {
		await setupi18n();
		const { component, listen } = await render(Dataframe, {
			headers: ["A", "B", "C"],
			values: [
				["1", "2", "3"],
				["4", "5", "6"]
			],
			col_count: [3, "fixed"],
			row_count: [2, "fixed"],
			editable: true,
			datatype: "str",
			root: ""
		});
		const mock = listen("change");
		component.value = {
			data: [
				["11", "22", "33"],
				["44", "55", "66"]
			],
			headers: ["A", "B", "C"],
			metadata: null
		};
		assert.equal(mock.callCount, 1);
	});
});
