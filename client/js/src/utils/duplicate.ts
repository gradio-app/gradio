import {
	get_space_hardware,
	hardware_types,
	set_space_timeout
} from "../helpers/spaces";
import type { DuplicateOptions } from "../types";
import { Client } from "../client";
import { SPACE_METADATA_ERROR_MSG } from "../constants";
import {
	get_cookie_header,
	parse_and_set_cookies
} from "../helpers/init_helpers";
import { process_endpoint } from "../helpers/api_info";

export async function duplicate(
	app_reference: string,
	options: DuplicateOptions
): Promise<Client> {
	const { hf_token, private: _private, hardware, timeout, auth } = options;

	if (hardware && !hardware_types.includes(hardware)) {
		throw new Error(
			`Invalid hardware type provided. Valid types are: ${hardware_types
				.map((v) => `"${v}"`)
				.join(",")}.`
		);
	}

	const { http_protocol, host } = await process_endpoint(
		app_reference,
		hf_token
	);

	let cookies: string[] | null = null;

	if (auth) {
		const cookie_header = await get_cookie_header(
			http_protocol,
			host,
			auth,
			fetch
		);

		if (cookie_header) cookies = parse_and_set_cookies(cookie_header);
	}

	const headers = {
		Authorization: `Bearer ${hf_token}`,
		"Content-Type": "application/json",
		...(cookies ? { Cookie: cookies.join("; ") } : {})
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

	try {
		if (!hardware) {
			original_hardware = await get_space_hardware(app_reference, hf_token);
		}
	} catch (e) {
		throw Error(SPACE_METADATA_ERROR_MSG + (e as Error).message);
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

		return await Client.connect(
			get_space_reference(duplicated_space.url),
			options
		);
	} catch (e: any) {
		throw new Error(e);
	}
}

function get_space_reference(url: string): any {
	const regex = /https:\/\/huggingface.co\/spaces\/([^/]+\/[^/]+)/;
	const match = url.match(regex);
	if (match) {
		return match[1];
	}
}
