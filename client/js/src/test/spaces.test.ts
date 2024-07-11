import { SPACE_STATUS_ERROR_MSG } from "../constants";
import {
	discussions_enabled,
	get_space_hardware,
	set_space_timeout,
	check_space_status
} from "../helpers/spaces";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";

import { initialise_server } from "./server";
import { hardware_sleeptime_response } from "./test_data";
import { vi } from "vitest";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("set_space_timeout", () => {
	it("should set the sleep timeout for a space", async () => {
		const space_id = "hmb/hello_world";
		const timeout = 60;
		const hf_token = "hf_123";

		const response = await set_space_timeout(space_id, timeout, hf_token);

		expect(response).toEqual(hardware_sleeptime_response);
	});

	it("should throw an error if the fetch call fails", async () => {
		const space_id = "hmb/server_test";
		const timeout = 60;
		const hf_token = "hf_123";

		await expect(
			set_space_timeout(space_id, timeout, hf_token)
		).rejects.toThrow(
			"Could not set sleep timeout on duplicated Space. Please visit *ADD HF LINK TO SETTINGS* to set a timeout manually to reduce billing charges."
		);
	});
});

describe("get_space_hardware", () => {
	it("should return the current hardware for a space", async () => {
		const space_id = "hmb/hello_world";
		const hf_token = "hf_123";

		const hardware = await get_space_hardware(space_id, hf_token);
		expect(hardware).toEqual(hardware_sleeptime_response.hardware.current);
	});

	it("should throw an error if the fetch call fails", async () => {
		const space_id = "hmb/bye_world";

		await expect(get_space_hardware(space_id)).rejects.toThrow(
			"Space hardware could not be obtained."
		);
	});
});

describe("discussions_enabled", () => {
	it("should return true if discussions are enabled for the space", async () => {
		const space_id = "hmb/hello_world";
		const result = await discussions_enabled(space_id);
		expect(result).toBe(true);
	});

	it("should return false if discussions are disabled for the space", async () => {
		const space_id = "hmb/bye_world";
		const result = await discussions_enabled(space_id);
		expect(result).toBe(false);
	});
});

describe("check_space_status", () => {
	const status_callback = vi.fn();

	it("should handle a successful response with RUNNING stage", async () => {
		const id = "hmb/hello_world";
		const type = "space_name";

		await check_space_status(id, type, status_callback);
		expect(status_callback).toHaveBeenCalledWith({
			status: "running",
			load_status: "complete",
			message: "Space is running.",
			detail: "RUNNING"
		});
	});

	it("should handle a successful response with PAUSED stage", async () => {
		const id = "hmb/paused_space";
		const type = "space_name";

		await check_space_status(id, type, status_callback);
		expect(status_callback).toHaveBeenCalledWith({
			status: "paused",
			load_status: "error",
			message:
				"This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
			detail: "PAUSED",
			discussions_enabled: true
		});
	});

	it("should handle a successful response with BUILDING stage", async () => {
		const id = "hmb/building_space";
		const type = "space_name";

		await check_space_status(id, type, status_callback);
		expect(status_callback).toHaveBeenCalledWith({
			status: "building",
			load_status: "pending",
			message: "Space is building...",
			detail: "BUILDING"
		});
	});

	it("should handle a successful response with STOPPED stage", async () => {
		const id = "hmb/stopped_space";
		const type = "space_name";

		await check_space_status(id, type, status_callback);
		expect(status_callback).toHaveBeenCalledWith({
			status: "sleeping",
			load_status: "pending",
			message: "Space is asleep. Waking it up...",
			detail: "STOPPED"
		});
	});

	it("should handle a failed response", async () => {
		const id = "hmb/failed_space";
		const type = "space_name";

		await check_space_status(id, type, status_callback);
		expect(status_callback).toHaveBeenCalledWith({
			status: "error",
			load_status: "error",
			message: SPACE_STATUS_ERROR_MSG,
			detail: "NOT_FOUND"
		});
	});
});
