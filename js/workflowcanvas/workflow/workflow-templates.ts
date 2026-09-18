export interface WorkflowTemplate {
	id: string;
	name: string;
	category: string;
	description: string;
	accent: string;
	gradient: string;
	workflow: Record<string, unknown>;
}

const TEMPLATES_URL =
	"https://huggingface.co/datasets/hmb/workflow-templates/resolve/main/templates.json";

let pending: Promise<WorkflowTemplate[]> | null = null;

async function fetch_templates(): Promise<WorkflowTemplate[]> {
	try {
		const res = await fetch(TEMPLATES_URL);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const templates = await res.json();
		return Array.isArray(templates) ? templates : [];
	} catch (err) {
		console.warn("[Workflow] could not load templates:", err);
		return [];
	}
}

export function load_templates(): Promise<WorkflowTemplate[]> {
	pending ??= fetch_templates();
	return pending;
}
