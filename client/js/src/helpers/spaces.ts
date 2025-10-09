import {
	RUNTIME_URL,
	SLEEPTIME_URL,
	SPACE_STATUS_ERROR_MSG
} from "../constants";
import { RE_SPACE_NAME } from "./api_info";
import type { SpaceStatusCallback } from "../types";

export async function check_space_status(
	id: string,
	type: "subdomain" | "space_name",
	status_callback: SpaceStatusCallback
): Promise<void> {
	let endpoint =
		type === "subdomain"
			? `https://huggingface.co/api/spaces/by-subdomain/${id}`
			: `https://huggingface.co/api/spaces/${id}`;
	let response;
	let _status;
	try {
		response = await fetch(endpoint);
		_status = response.status;
		if (_status !== 200) {
			throw new Error();
		}
		response = await response.json();
	} catch (e) {
		status_callback({
			status: "error",
			load_status: "error",
			message: SPACE_STATUS_ERROR_MSG,
			detail: "NOT_FOUND"
		});
		return;
	}

	if (!response || _status !== 200) return;
	const {
		runtime: { stage },
		id: space_name
	} = response;

	switch (stage) {
		case "STOPPED":
		case "SLEEPING":
			status_callback({
				status: "sleeping",
				load_status: "pending",
				message: "Space is asleep. Waking it up...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, status_callback);
			}, 1000); // poll for status
			break;
		case "PAUSED":
			status_callback({
				status: "paused",
				load_status: "error",
				message:
					"This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
		case "RUNNING":
		case "RUNNING_BUILDING":
			status_callback({
				status: "running",
				load_status: "complete",
				message: "Space is running.",
				detail: stage
			});
			break;
		case "BUILDING":
			status_callback({
				status: "building",
				load_status: "pending",
				message: "Space is building...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, status_callback);
			}, 1000);
			break;
		case "APP_STARTING":
			status_callback({
				status: "starting",
				load_status: "pending",
				message: "Space is starting...",
				detail: stage
			});

			setTimeout(() => {
				check_space_status(id, type, status_callback);
			}, 1000);
			break;
		default:
			status_callback({
				status: "space_error",
				load_status: "error",
				message: "This space is experiencing an issue.",
				detail: stage,
				discussions_enabled: await discussions_enabled(space_name)
			});
			break;
	}
}

export const check_and_wake_space = async (
	space_id: string,
	status_callback: SpaceStatusCallback
): Promise<void> => {
	let retries = 0;
	const max_retries = 12;
	const check_interval = 5000;

	return new Promise((resolve) => {
		check_space_status(
			space_id,
			RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
			(status) => {
				status_callback(status);

				if (status.status === "running") {
					resolve();
				} else if (
					status.status === "error" ||
					status.status === "paused" ||
					status.status === "space_error"
				) {
					resolve();
				} else if (
					status.status === "sleeping" ||
					status.status === "building"
				) {
					if (retries < max_retries) {
						retries++;
						setTimeout(() => {
							check_and_wake_space(space_id, status_callback).then(resolve);
						}, check_interval);
					} else {
						resolve();
					}
				}
			}
		);
	});
};

const RE_DISABLED_DISCUSSION =
	/^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
export async function discussions_enabled(space_id: string): Promise<boolean> {
	try {
		const r = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/discussions`,
			{
				method: "HEAD"
			}
		);

		const error = r.headers.get("x-error-message");

		if (!r.ok || (error && RE_DISABLED_DISCUSSION.test(error))) return false;
		return true;
	} catch (e) {
		return false;
	}
}

export async function get_space_hardware(
	space_id: string,
	token?: `hf_${string}` | undefined
): Promise<(typeof hardware_types)[number]> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const res = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/${RUNTIME_URL}`,
			{ headers }
		);

		if (res.status !== 200)
			throw new Error("Space hardware could not be obtained.");

		const { hardware } = await res.json();

		return hardware.current;
	} catch (e: any) {
		throw new Error(e.message);
	}
}

export async function set_space_timeout(
	space_id: string,
	timeout: number,
	token?: `hf_${string}`
): Promise<any> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const body: {
		seconds?: number;
	} = {
		seconds: timeout
	};

	try {
		const res = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/${SLEEPTIME_URL}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", ...headers },
				body: JSON.stringify(body)
			}
		);

		if (res.status !== 200) {
			throw new Error(
				"Could not set sleep timeout on duplicated Space. Please visit *ADD HF LINK TO SETTINGS* to set a timeout manually to reduce billing charges."
			);
		}

		const response = await res.json();
		return response;
	} catch (e: any) {
		throw new Error(e.message);
	}
}

export const hardware_types = [
	"cpu-basic",
	"cpu-upgrade",
	"cpu-xl",
	"t4-small",
	"t4-medium",
	"a10g-small",
	"a10g-large",
	"a10g-largex2",
	"a10g-largex4",
	"a100-large",
	"zero-a10g",
	"h100",
	"h100x8"
] as const;
