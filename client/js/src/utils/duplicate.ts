import {
	get_space_hardware,
	hardware_types,
	set_space_timeout
} from "../helpers/spaces";
import type { DuplicateOptions } from "../types";
import { Client } from "../client";

export async function duplicate(
	app_reference: string,
	options: DuplicateOptions
): Promise<Client> {
	const { hf_token, private: _private, hardware, timeout } = options;

	if (hardware && !hardware_types.includes(hardware)) {
		throw new Error(
			`Invalid hardware type provided. Valid types are: ${hardware_types
				.map((v) => `"${v}"`)
				.join(",")}.`
		);
	}
	const headers = {
		Authorization: `Bearer ${hf_token}`,
		"Content-Type": "application/json"
	};

	const user = (
		await (
			await fetch(`https://huggingface.co/api/whoami-v2`, {
				headers
			})
		).json()
	).name;

	const space_name = app_reference.split("/")[1];
	const body: {
		repository: string;
		private?: boolean;
		hardware?: string;
	} = {
		repository: `${user}/${space_name}`
	};

	if (_private) {
		body.private = true;
	}

	let original_hardware;

	if (!hardware) {
		original_hardware = await get_space_hardware(app_reference, hf_token);
	}

	const requested_hardware = hardware || original_hardware || "cpu-basic";

	body.hardware = requested_hardware;

	try {
		const response = await fetch(
			`https://huggingface.co/api/spaces/${app_reference}/duplicate`,
			{
				method: "POST",
				headers,
				body: JSON.stringify(body)
			}
		);

		if (response.status === 409) {
			try {
				const client = await Client.connect(`${user}/${space_name}`, options);
				return client;
			} catch (error) {
				console.error("Failed to connect Client instance:", error);
				throw error;
			}
		} else if (response.status !== 200) {
			throw new Error(response.statusText);
		}

		const duplicated_space = await response.json();

		await set_space_timeout(`${user}/${space_name}`, timeout || 300, hf_token);
		return await Client.connect(duplicated_space.url, options);
	} catch (e: any) {
		throw new Error(e);
	}
}
