import type { PortType, Port } from "./workflow-types";
import { modalityForPort } from "./workflow-modalities";
import type { ModalityConfig } from "./workflow-modalities";

export function normalize_space_id(raw: string): string | null {
	const trimmed = raw.trim().replace(/\/+$/, "");
	if (!trimmed) return null;

	if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
		return trimmed;
	}

	const pageMatch = trimmed.match(
		/^https?:\/\/(?:www\.)?huggingface\.co\/spaces\/([^/\s?#]+)\/([^/\s?#]+)/i
	);
	if (pageMatch) return `${pageMatch[1]}/${pageMatch[2]}`;

	const sub = trimmed.match(/^https?:\/\/([^/]+)\.hf\.space/i);
	if (sub) {
		const parts = sub[1].split("-");
		if (parts.length >= 2) {
			return `${parts[0]}/${parts.slice(1).join("-")}`;
		}
	}

	return null;
}

export function componentToPortType(
	component: string,
	type?: string,
	pythonType?: string,
	labelHint?: string
): PortType | "__skip__" {
	const c = component.toLowerCase();
	if (pythonType) {
		const cleaned = pythonType
			.toLowerCase()
			.replace(/^none\s*\|\s*/, "")
			.replace(/\s*\|\s*none$/, "")
			.trim();
		if (cleaned === "str" || cleaned === "string") return "text";
		if (cleaned === "int" || cleaned === "integer" || cleaned === "float")
			return "number";
		if (cleaned === "bool" || cleaned === "boolean") return "boolean";
	}
	if (c === "image" || c === "imageeditor" || c === "imageslider")
		return "image";
	if (c === "gallery") return "gallery";
	if (c === "audio") return "audio";
	if (c === "video") return "video";
	if (c === "number" || c === "slider") return "number";
	if (c === "checkbox") return "boolean";
	if (c === "file" || c === "uploadbutton" || c === "downloadbutton")
		return "file";
	if (c === "model3d") return "model3d";
	if (c === "json" || c === "dataframe") return "json";
	if (c === "state") return "__skip__";
	if (
		c === "textbox" ||
		c === "text" ||
		c === "markdown" ||
		c === "chatbot" ||
		c === "label" ||
		c === "code" ||
		c === "highlightedtext" ||
		c === "dropdown" ||
		c === "radio" ||
		c === "checkboxgroup" ||
		c === "colorpicker" ||
		c === "html"
	)
		return "text";

	// gr.api endpoints use component="Api" with python_type carrying the
	// real hint — primitives already handled at the top of the function.
	if (pythonType) {
		const cleaned = pythonType
			.toLowerCase()
			.replace(/^none\s*\|\s*/, "")
			.replace(/\s*\|\s*none$/, "")
			.trim();
		if (
			cleaned === "filepath" ||
			cleaned === "file" ||
			cleaned.includes("filedata")
		) {
			const l = (labelHint ?? "").toLowerCase();
			if (/audio|wav|mp3|voice|sound|speech|tts|asr/.test(l)) return "audio";
			if (/image|img|photo|picture|pic\b/.test(l)) return "image";
			if (/video|mp4|movie|clip/.test(l)) return "video";
			if (/model3d|mesh|glb|gltf|obj\b/.test(l)) return "model3d";
			return "file";
		}
		if (
			cleaned.includes("dict") ||
			cleaned.includes("list") ||
			cleaned.includes("any")
		)
			return "json";
	}

	// Fallback: check the type field from the API
	if (type) {
		const t = typeof type === "string" ? type.toLowerCase() : "";
		if (t.includes("image") || t.includes("pil")) return "image";
		if (t.includes("video") || t.includes("mp4")) return "video";
		if (t.includes("audio") || t.includes("wav") || t.includes("mp3"))
			return "audio";
		if (t.includes("filepath") || t.includes("file")) return "file";
		if (t === "number" || t === "float" || t === "int" || t === "integer")
			return "number";
		if (t === "bool" || t === "boolean") return "boolean";
		if (t === "str" || t === "string") return "text";
	}

	return "any";
}

/** Prefixes that indicate utility/event-handler endpoints — skip these */
const UTILITY_PREFIXES = [
	"/on_",
	"/handle_",
	"/update_",
	"/prepare_",
	"/load_",
	"/clear_",
	"/reset_"
];

export interface EndpointSig {
	name: string;
	inputs: Port[];
	outputs: Port[];
}

export interface SpaceApiInfo {
	endpoint: string;
	inputs: Port[];
	outputs: Port[];
	width: number;
	endpoints: EndpointSig[];
}

const ORDINAL_LABEL = /^\d+(st|nd|rd|th)$/i;

export function extract_choices(
	type: unknown
): { choices: string[]; multiselect: boolean } | null {
	if (!type || typeof type !== "object") return null;
	const t = type as { type?: string; enum?: unknown[]; items?: any };
	if (Array.isArray(t.enum) && t.enum.length > 0) {
		return { choices: t.enum.map(String), multiselect: false };
	}
	if (t.type === "array" && t.items && Array.isArray(t.items.enum)) {
		return { choices: t.items.enum.map(String), multiselect: true };
	}
	return null;
}

function parse_endpoint_sig(name: string, ep: any): EndpointSig {
	const inputs = (ep.parameters ?? [])
		.map((p: any, i: number) => {
			const isApi = (p.component ?? "").toLowerCase() === "api";
			const pyType = p.python_type?.type;
			const labelHint = p.parameter_name || p.label || "";
			const portType = componentToPortType(
				p.component ?? "",
				typeof p.type === "string" ? p.type : "",
				pyType,
				labelHint
			);
			if (portType === "__skip__") return null;
			const hasDefault = p.parameter_has_default === true;
			const useParamName =
				(isApi || ORDINAL_LABEL.test(p.label ?? "")) && p.parameter_name;
			const rawLabel = useParamName
				? p.parameter_name
				: p.label || p.parameter_name || `Input ${i}`;
			const choiceInfo = extract_choices(p.type);
			return {
				id: `in_${i}`,
				label: rawLabel,
				type: portType,
				required: !hasDefault,
				default_value:
					hasDefault && p.default !== undefined ? p.default : undefined,
				...(choiceInfo ?? {})
			};
		})
		.filter(Boolean) as Port[];

	const outputs = (ep.returns ?? [])
		.map((r: any, i: number) => {
			const isApi = (r.component ?? "").toLowerCase() === "api";
			const pyType = r.python_type?.type;
			const labelHint = isApi
				? `${r.parameter_name ?? ""} ${name ?? ""}`.trim()
				: r.parameter_name || r.label || "";
			const portType = componentToPortType(
				r.component ?? "",
				typeof r.type === "string" ? r.type : "",
				pyType,
				labelHint
			);
			if (portType === "__skip__") return null;
			const useParamName =
				(isApi || ORDINAL_LABEL.test(r.label ?? "")) && r.parameter_name;
			const rawLabel = useParamName
				? r.parameter_name
				: r.label || `Output ${i}`;
			return {
				id: `out_${i}`,
				label: rawLabel,
				type: portType,
				output_index: i
			};
		})
		.filter(Boolean) as Port[];

	if (inputs.length === 0)
		inputs.push({ id: "in", label: "Input", type: "any" as PortType });
	if (outputs.length === 0)
		outputs.push({ id: "out", label: "Output", type: "any" as PortType });

	return { name, inputs, outputs };
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

	const spaceUrl = spaceId.startsWith("http")
		? spaceId
		: `https://${spaceId.replace("/", "-").replaceAll(".", "-").toLowerCase()}.hf.space`;

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
			if (res.ok) {
				infoRes = res;
				break;
			}
		} catch {
			/* try next */
		}
	}
	if (!infoRes)
		throw new Error(
			"Could not connect to Space — it may be sleeping or have no Gradio API"
		);

	const api = await infoRes.json();
	const named = api.named_endpoints ?? {};
	const unnamed = api.unnamed_endpoints ?? {};

	const all_endpoints: Array<[string, any]> = [
		...Object.entries(named),
		...Object.entries(unnamed)
	].filter(([n]) => !UTILITY_PREFIXES.some((p) => n.startsWith(p)));

	if (all_endpoints.length === 0) {
		throw new Error("No suitable endpoints found");
	}

	// Default to /predict if present (most common Gradio convention), else
	// the first non-utility endpoint. Users can switch via the node dropdown.
	const default_index = Math.max(
		0,
		all_endpoints.findIndex(([n]) => n === "/predict")
	);
	const [epName, ep] = all_endpoints[default_index];
	const endpoints: EndpointSig[] = all_endpoints.map(([n, e]) =>
		parse_endpoint_sig(n, e)
	);

	const picked = parse_endpoint_sig(epName, ep);
	const inputs = picked.inputs;
	const outputs = picked.outputs;

	const label = spaceId.split("/").pop() ?? spaceId;
	const maxPortLen = Math.max(
		...inputs.map((p: any) => (p.label as string).length),
		...outputs.map((p: any) => (p.label as string).length),
		label.length
	);
	const width = Math.max(280, Math.min(400, maxPortLen * 9 + 100));

	const result = { endpoint: epName, inputs, outputs, width, endpoints };
	spaceApiCache.set(spaceId, result);
	return result;
}

/**
 * Clamp inferred port types so a fallback `any` or `file` becomes the
 * modality's canonical type when the modality is known. Models picked via
 * `pipeline_tag` and Spaces picked via the modality picker carry that hint;
 * passing it lets us avoid surfacing generic `any`/`file` ports in the UI.
 *
 * If `modality` is null (e.g. unknown), ports are returned unchanged.
 */
export function normalizeOperatorPorts(
	modality: ModalityConfig | null,
	ports: Port[]
): Port[] {
	if (!modality?.port_type) return ports;
	const canonical = modality.port_type;
	return ports.map((p) => {
		if (p.type === "any" || p.type === "file") {
			return { ...p, type: canonical };
		}
		return p;
	});
}

/**
 * Canonicalize a single port type using the modality registry. Used by
 * schema lookups (TASK_SCHEMAS) to clamp legacy `any`/`file` entries.
 * Pass-through for already-specific types.
 */
export function canonicalizePort(type: PortType, hint?: PortType): PortType {
	if (type !== "any" && type !== "file") return type;
	if (!hint) return type;
	const modality = modalityForPort(hint);
	return modality?.port_type ?? type;
}
