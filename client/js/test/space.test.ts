import fetchMock from "fetch-mock";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	check_space_status,
	discussions_enabled,
	get_space_hardware,
	hardware_types,
	set_space_timeout
} from "../src/helpers/spaces";

describe("check and update space status", () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	it('calls status_callback with "running" status when space is RUNNING', async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "RUNNING" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "running",
			load_status: "complete",
			message: "",
			detail: "RUNNING"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);

		fetchMock.restore();
	});

	it('calls status_callback with "paused" status when space is PAUSED', async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "PAUSED" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "paused",
			load_status: "error",
			discussions_enabled: false,
			message:
				"This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
			detail: "PAUSED"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});

	it('calls status_callback with "error" status when space is ERROR', async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "ERROR" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "space_error",
			discussions_enabled: false,
			load_status: "error",
			message: "This space is experiencing an issue.",
			detail: "ERROR"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});

	it("calls status_callback with 'error' status when space is BUILDING", async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "BUILDING" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "building",
			load_status: "pending",
			message: "Space is building...",
			detail: "BUILDING"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});

	it("calls status_callback with BUILDING status when space is RUNNING_BUILDING", async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "RUNNING_BUILDING" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "running",
			load_status: "complete",
			message: "",
			detail: "RUNNING_BUILDING"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});

	it("calls status_callback with 'error' status when space is STOPPED", async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "STOPPED" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "sleeping",
			load_status: "pending",
			message: "Space is asleep. Waking it up...",
			detail: "STOPPED"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});

	it("calls status_callback with 'error' status when space is SLEEPING", async () => {
		fetchMock.mock("https://huggingface.co/api/spaces/abidlabs/whisper", {
			status: 200,
			body: {
				runtime: { stage: "SLEEPING" },
				id: "abidlabs/whisper"
			}
		});

		const mockCallback = vi.fn();

		await check_space_status("abidlabs/whisper", "space_name", mockCallback);

		expect(mockCallback).toHaveBeenCalledWith({
			status: "sleeping",
			load_status: "pending",
			message: "Space is asleep. Waking it up...",
			detail: "SLEEPING"
		});

		expect(
			fetchMock.called("https://huggingface.co/api/spaces/abidlabs/whisper")
		).toBe(true);
	});
});

describe("discussions_enabled", () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	it("returns true when discussions are enabled", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/discussions`,
			{
				status: 200,
				headers: { "x-error-message": "" }
			}
		);

		const result = await discussions_enabled("abidlabs/whisper");
		expect(result).toBe(true);
	});

	it("returns false when discussions are disabled", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/discussions`,
			{
				status: 200,
				headers: { "x-error-message": "Discussions are disabled" }
			}
		);

		const result = await discussions_enabled("abidlabs/whisper");
		expect(result).toBe(false);
	});

	it("returns false on network or fetch error", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/discussions`,
			{
				throws: new Error("Network error")
			}
		);

		const result = await discussions_enabled("abidlabs/whisper");
		expect(result).toBe(false);
	});
});

describe("get_space_hardware", () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	it("returns hardware type on successful request", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/runtime`,
			{
				status: 200,
				body: {
					stage: "RUNNING",
					hardware: {
						current: "t4-small",
						requested: "t4-small"
					},
					storage: null,
					gcTimeout: null,
					replicas: {
						current: 1,
						requested: 1
					},
					debug: false
				}
			}
		);

		const hardware = await get_space_hardware("abidlabs/whisper");

		expect(hardware).toBe("t4-small");
	});

	it("throws an error when unauthorized", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/runtime`,
			{
				status: 401,
				body: { message: "Unauthorized" }
			}
		);

		await expect(get_space_hardware("abidlabs/whisper")).rejects.toThrow(
			"Space hardware could not be obtained."
		);
	});

	it("throws an error on server error", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/runtime`,
			{
				status: 500,
				body: { message: "Server error" }
			}
		);

		await expect(get_space_hardware("abidlabs/whisper")).rejects.toThrow(
			"Space hardware could not be obtained."
		);
	});

	it("throws an error on network error", async () => {
		fetchMock.mock(
			`https://huggingface.co/api/spaces/abidlabs/whisper/runtime`,
			{
				throws: new Error("Network error")
			}
		);

		await expect(get_space_hardware("abidlabs/whisper")).rejects.toThrow(
			"Network error"
		);
	});
});

describe("set_space_timeout", () => {
	const space_id = "abidlabs/whisper";
	const valid_token = "hf_token";
	const invalid_token = "hf_invalid";

	beforeEach(() => {
		fetchMock.restore();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	it("successfully sets space timeout with valid token", async () => {
		const timeout = 300;

		fetchMock.mock(`https://huggingface.co/api/spaces/${space_id}/sleeptime`, {
			status: 200,
			method: "POST",
			body: { seconds: timeout }
		});

		const response: Response = await set_space_timeout(
			space_id,
			timeout,
			valid_token
		);

		expect(response.body).toEqual({ seconds: timeout });

		expect(fetchMock.lastOptions()?.headers).toEqual({
			Authorization: `Bearer ${valid_token}`,
			"Content-Type": "application/json"
		});
	});

	it("throws an error with invalid token", async () => {
		const timeout = 300;
		fetchMock.mock(`https://huggingface.co/api/spaces/${space_id}/sleeptime`, {
			status: 403
		});

		await expect(
			set_space_timeout(space_id, timeout, invalid_token)
		).rejects.toThrow(
			"Could not set sleep timeout on duplicated Space. Please visit *ADD HF LINK TO SETTINGS* to set a timeout manually to reduce billing charges."
		);
	});

	it("throws an error when setting timeout fails due to server error", async () => {
		const timeout = 300;
		fetchMock.mock(`https://huggingface.co/api/spaces/${space_id}/sleeptime`, {
			status: 500
		});

		await expect(
			set_space_timeout(space_id, timeout, valid_token)
		).rejects.toThrow(
			"Could not set sleep timeout on duplicated Space. Please visit *ADD HF LINK TO SETTINGS* to set a timeout manually to reduce billing charges."
		);
	});
});
