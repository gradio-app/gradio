import type { PortType } from "./workflow-types";

/** Map Gradio component types to our port types */
export function componentToPortType(component: string, type?: string): PortType {
	const c = component.toLowerCase();
	if (c === "image" || c === "imageeditor" || c === "imageslider") return "image";
	if (c === "gallery") return "gallery";
	if (c === "audio") return "audio";
	if (c === "video") return "video";
	if (c === "number" || c === "slider") return "number";
	if (c === "checkbox") return "boolean";
	if (c === "file" || c === "uploadbutton" || c === "downloadbutton") return "file";
	if (c === "model3d") return "model3d";
	if (c === "json" || c === "dataframe") return "json";
	if (c === "state") return "__skip__" as PortType; // internal, not user I/O
	if (c === "textbox" || c === "text" || c === "markdown" || c === "chatbot" || c === "label" || c === "code" || c === "highlightedtext" || c === "dropdown" || c === "radio" || c === "checkboxgroup" || c === "colorpicker" || c === "html") return "text";

	// Fallback: check the type field from the API
	if (type) {
		const t = typeof type === "string" ? type.toLowerCase() : "";
		if (t.includes("image") || t.includes("pil")) return "image";
		if (t.includes("video") || t.includes("mp4")) return "video";
		if (t.includes("audio") || t.includes("wav") || t.includes("mp3")) return "audio";
		if (t.includes("filepath") || t.includes("file")) return "file";
		if (t === "number" || t === "float" || t === "int" || t === "integer") return "number";
		if (t === "bool" || t === "boolean") return "boolean";
		if (t === "str" || t === "string") return "text";
	}

	return "any";
}

/** Preferred endpoint names in priority order */
const PREFERRED_ENDPOINTS = ["/predict", "/infer", "/generate", "/run", "/process", "/translate"];

/** Prefixes that indicate utility/event-handler endpoints — skip these */
const UTILITY_PREFIXES = ["/on_", "/handle_", "/update_", "/prepare_", "/load_", "/clear_", "/reset_"];

/** File-like components score much higher than scalar outputs */
const FILE_COMPONENTS = new Set(["video", "image", "imageeditor", "imageslider", "audio", "file", "uploadbutton", "gallery", "model3d"]);

function outputScore(ep: any): number {
	return (ep.returns ?? []).reduce((s: number, r: any) => {
		const comp = (r.component ?? "").toLowerCase();
		return s + (FILE_COMPONENTS.has(comp) ? 10 : 1);
	}, 0);
}

function pickBestEndpoint(endpoints: Record<string, any>): string {
	const names = Object.keys(endpoints);

	// Filter out event-handler / utility endpoints
	const candidates = names.filter(n => !UTILITY_PREFIXES.some(p => n.startsWith(p)));
	const pool = candidates.length > 0 ? candidates : names;

	// Prefer well-known names first
	for (const pref of PREFERRED_ENDPOINTS) {
		if (pool.includes(pref)) return pref;
	}

	// Pick the endpoint with the richest outputs (file outputs >> scalar outputs)
	return pool.slice().sort((a, b) => outputScore(endpoints[b]) - outputScore(endpoints[a]))[0];
}

export interface SpaceApiInfo {
	endpoint: string;
	inputs: any[];
	outputs: any[];
	width: number;
}

/** Cache for fetched API info */
const spaceApiCache = new Map<string, SpaceApiInfo>();

/**
 * Fetch API info from a Space and return endpoint, inputs, outputs.
 * Results are cached by space_id.
 */
export async function fetchSpaceApi(spaceId: string): Promise<SpaceApiInfo> {
	const cached = spaceApiCache.get(spaceId);
	if (cached) return cached;

	const spaceUrl = spaceId.startsWith("http") ? spaceId : `https://${spaceId.replace("/", "-").replaceAll(".", "-").toLowerCase()}.hf.space`;

	// Try multiple API paths — older Spaces use /info, newer use /gradio_api/info
	let infoRes: Response | null = null;
	for (const path of ["/gradio_api/info", "/info", "/api/info"]) {
		try {
			const res = await Promise.race([
				fetch(`${spaceUrl}${path}`),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("Timed out")), 10000)
				)
			]);
			if (res.ok) { infoRes = res; break; }
		} catch { /* try next */ }
	}
	if (!infoRes) throw new Error("Could not connect to Space — it may be sleeping or have no Gradio API");

	const api = await infoRes.json();
	const named = api.named_endpoints ?? {};
	const unnamed = api.unnamed_endpoints ?? {};

	if (Object.keys(named).length === 0 && Object.keys(unnamed).length === 0) {
		throw new Error("No API endpoints found");
	}

	// Use the same endpoint the Space UI uses by default:
	// 1. Apply heuristic to named endpoints (filters utility, prefers rich outputs)
	// 2. Check unnamed[0] as fallback, but validate it's not a utility endpoint
	// 3. Fallback to /predict if it exists
	let epName: string;
	let ep: any;

	// Try heuristic on named endpoints first (catches event handlers)
	const namedEndpoint = Object.keys(named).length > 0 ? pickBestEndpoint(named) : null;
	if (namedEndpoint && !UTILITY_PREFIXES.some(p => namedEndpoint.startsWith(p))) {
		epName = namedEndpoint;
		ep = named[epName];
	} else if (unnamed["0"]) {
		// unnamed[0] is the Submit button, but still apply validation
		epName = "0";
		ep = unnamed["0"];
	} else if (named["/predict"]) {
		epName = "/predict";
		ep = named["/predict"];
	} else if (namedEndpoint) {
		// Fallback even if it's a utility endpoint (better than nothing)
		epName = namedEndpoint;
		ep = named[epName];
	} else {
		throw new Error("No suitable endpoint found");
	}


	const inputs = (ep.parameters ?? [])
		.map((p: any, i: number) => {
			const portType = componentToPortType(p.component ?? "", typeof p.type === "string" ? p.type : "");
			if (portType === "__skip__") return null;
			// Use parameter_has_default from API, not the default value itself
			// (dict format returns default=None even for optional params with defaults)
			const hasDefault = p.parameter_has_default === true;
			return {
				id: `in_${i}`,
				label: p.label || p.parameter_name || `Input ${i}`,
				type: portType,
				required: !hasDefault,
				default_value: hasDefault && p.default !== undefined ? p.default : undefined
			};
		})
		.filter(Boolean);

	const outputs = (ep.returns ?? [])
		.map((r: any, i: number) => {
			const portType = componentToPortType(r.component ?? "", typeof r.type === "string" ? r.type : "");
			if (portType === "__skip__") return null;
			return {
				id: `out_${i}`,
				label: r.label || `Output ${i}`,
				type: portType
			};
		})
		.filter(Boolean);

	// Fallback if introspection returns empty
	if (inputs.length === 0) inputs.push({ id: "in", label: "Input", type: "any" as PortType });
	if (outputs.length === 0) outputs.push({ id: "out", label: "Output", type: "any" as PortType });

	const label = spaceId.split("/").pop() ?? spaceId;
	const maxPortLen = Math.max(
		...inputs.map((p: any) => (p.label as string).length),
		...outputs.map((p: any) => (p.label as string).length),
		label.length
	);
	const width = Math.max(280, Math.min(400, maxPortLen * 9 + 100));

	const result = { endpoint: epName, inputs, outputs, width };
	spaceApiCache.set(spaceId, result);
	return result;
}
