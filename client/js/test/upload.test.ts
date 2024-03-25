import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fetchMock from "fetch-mock";
import { upload_files } from "../src/utils/upload_files";
import { BROKEN_CONNECTION_MSG } from "../src/constants";

describe("upload_files", () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	let endpoint = "localhost:7860";

	it("returns an error message on connection failure", async () => {
		const files = [new Blob(["file contents"], { type: "text/plain" })];
		const response = await upload_files(endpoint, files);

		expect(response).toEqual({ error: BROKEN_CONNECTION_MSG });
	});

	afterEach(() => {
		fetchMock.restore();
	});
});
