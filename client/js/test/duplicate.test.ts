import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { duplicate } from "../src/utils/duplicate";
import fetchMock from "fetch-mock";
import { Client } from "../src/Client";
import { DuplicateOptions } from "../src/types";

describe("duplicate", () => {
	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		fetchMock.restore();
		vi.restoreAllMocks();
	});

	test("successfully duplicates a space", async () => {
		fetchMock.mock("https://huggingface.co/api/whoami-v2", {
			status: 200,
			body: { name: "abidlabs" }
		});

		fetchMock.mock(
			"https://huggingface.co/api/spaces/abidlabs/whisper/duplicate",
			{
				status: 200,
				body: { url: "abidlabs/whisper" }
			}
		);

		fetchMock.mock(
			"https://huggingface.co/api/spaces/abidlabs/whisper/hardware",
			{
				status: 200,
				body: {}
			}
		);

		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper/host", {
			status: 200,
			body: {
				host: "huggingface.co"
			}
		});

		fetchMock.mock(
			"https://huggingface.co/api/spaces/abidlabs/whisper/sleeptime",
			{
				status: 200,
				body: {}
			}
		);

		const options: DuplicateOptions = {
			hf_token: "hf_test_token",
			private: true,
			hardware: "cpu-basic",
			timeout: 300,
			status_callback: () => {}
		};

		const clientReturn = await duplicate("abidlabs/whisper", options);

		expect(clientReturn).toBeInstanceOf(Client);
		expect(clientReturn.app_reference).toBe("abidlabs/whisper");
		expect(clientReturn.options).toEqual(options);
	});
});
