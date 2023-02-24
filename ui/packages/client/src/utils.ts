export function determine_protocol(endpoint: string): {
	protocol: "ws" | "wss";
	host: string;
} {
	if (endpoint.startsWith("http")) {
		const { protocol, host } = new URL(endpoint);

		if (host.endsWith("hf.space")) {
			// space subdomain
			return {
				protocol: "wss",
				host: endpoint
			};
		} else {
			return {
				protocol: protocol === "https" ? "wss" : "wss",
				host
			};
		}
	}

	// default to secure if no protocol is provided
	return {
		protocol: "wss",
		host: endpoint
	};
}

export const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;

export function process_endpoint(app_reference: string): {
	space_id: string | false;
	host: string;
	protocol: "ws" | "wss";
} {
	const _app_reference = app_reference.trim();

	if (RE_SPACE_NAME.test(_app_reference)) {
		// get app details from API
		return {
			space_id: _app_reference,
			...determine_protocol(_app_reference)
		};
	}

	if (_app_reference.endsWith("hf.space")) {
		const { protocol, host } = determine_protocol(_app_reference);
		return {
			space_id: host.replace(".hf.space", ""),
			protocol,
			host
		};
	}

	return {
		space_id: false,
		...determine_protocol(_app_reference)
	};
}
