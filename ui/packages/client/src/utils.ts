export function determine_protocol(endpoint: string): {
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
	host: string;
} {
	if (endpoint.startsWith("http")) {
		const { protocol, host } = new URL(endpoint);
		console.log(new URL(endpoint));

		if (host.endsWith("hf.space")) {
			// space subdomain
			return {
				ws_protocol: "wss",
				host: host,
				http_protocol: protocol as "http:" | "https:"
			};
		} else {
			return {
				ws_protocol: protocol === "https:" ? "wss" : "wss",
				http_protocol: protocol as "http:" | "https:",
				host
			};
		}
	}

	// default to secure if no protocol is provided
	return {
		ws_protocol: "wss",
		http_protocol: "https:",
		host: endpoint
	};
}

export const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;
export const RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;
export async function process_endpoint(app_reference: string): Promise<{
	space_id: string | false;
	host: string;
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
}> {
	const _app_reference = app_reference.trim();

	if (RE_SPACE_NAME.test(_app_reference)) {
		// get app details from API
		console.log(app_reference);
		const _host = (
			await (
				await fetch(`https://huggingface.co/api/spaces/${_app_reference}/host`)
			).json()
		).host;
		return {
			space_id: app_reference,
			...determine_protocol(_host)
		};
	}

	if (RE_SPACE_DOMAIN.test(_app_reference)) {
		const { ws_protocol, http_protocol, host } =
			determine_protocol(_app_reference);

		console.log({ host });
		return {
			space_id: host.replace(".hf.space", ""),
			ws_protocol,
			http_protocol,
			host
		};
	}

	return {
		space_id: false,
		...determine_protocol(_app_reference)
	};
}
