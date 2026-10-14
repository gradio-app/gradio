/**
 * Per-viewer secrets. An API key is the viewer's, not the author's, and
 * `workflow.json` gets pushed to a Hub repo — so `sanitize_for_save` drops it
 * and it is mirrored here into localStorage instead, keyed by workflow name,
 * the same scheme `layout-persistence.ts` uses for geometry.
 */

import { is_secret } from "./workflow-types";
import type { ReferenceNode, Workflow } from "./workflow-types";

export type WorkflowSecrets = Record<string, string>;

export function secret_storage_key(name: string): string {
	return `gradio_workflow_secrets:${name}`;
}

function default_storage(): Storage | undefined {
	return typeof localStorage !== "undefined" ? localStorage : undefined;
}

function secret_nodes(wf: Workflow): ReferenceNode[] {
	return wf.references.filter(is_secret);
}

function value_port(node: ReferenceNode): string | undefined {
	return node.outputs[0]?.id;
}

export function load_secrets(
	name: string,
	storage: Storage | undefined = default_storage()
): WorkflowSecrets {
	if (!storage) return {};
	try {
		const parsed = JSON.parse(storage.getItem(secret_storage_key(name)) ?? "");
		if (!parsed || typeof parsed !== "object") return {};
		const secrets: WorkflowSecrets = {};
		for (const [id, value] of Object.entries(parsed)) {
			if (typeof value === "string") secrets[id] = value;
		}
		return secrets;
	} catch {
		return {};
	}
}

export function save_secrets(
	name: string,
	secrets: WorkflowSecrets,
	storage: Storage | undefined = default_storage()
): void {
	if (!storage) return;
	try {
		const key = secret_storage_key(name);
		if (Object.keys(secrets).length === 0) storage.removeItem(key);
		else storage.setItem(key, JSON.stringify(secrets));
	} catch {}
}

export function extract_secrets(wf: Workflow): WorkflowSecrets {
	const secrets: WorkflowSecrets = {};
	for (const node of secret_nodes(wf)) {
		const port = value_port(node);
		const value = port ? node.data?.[port] : undefined;
		if (typeof value === "string" && value) secrets[node.id] = value;
	}
	return secrets;
}

export function apply_secrets(
	wf: Workflow,
	secrets: WorkflowSecrets
): Workflow {
	if (Object.keys(secrets).length === 0) return wf;
	return {
		...wf,
		references: wf.references.map((node) => {
			const port = is_secret(node) ? value_port(node) : undefined;
			const stored = secrets[node.id];
			if (!port || typeof stored !== "string") return node;
			return { ...node, data: { ...node.data, [port]: stored } };
		})
	};
}
