// API keys are per-viewer: kept in localStorage, never written to workflow.json.

import { is_secret, is_secret_port } from "./workflow-types";
import type { AnyNode, Workflow } from "./workflow-types";
import { allNodes } from "./workflow-migration";

export type WorkflowSecrets = Record<string, string>;

export function secret_storage_key(name: string): string {
	return `gradio_workflow_secrets:${name}`;
}

function default_storage(): Storage | undefined {
	return typeof localStorage !== "undefined" ? localStorage : undefined;
}

function secret_ports(node: AnyNode): string[] {
	const ports = node.inputs.filter(is_secret_port).map((p) => p.id);
	if (is_secret(node) && node.outputs[0]) ports.push(node.outputs[0].id);
	return ports;
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
	for (const node of allNodes(wf)) {
		for (const port of secret_ports(node)) {
			const value = node.data?.[port];
			if (typeof value === "string" && value) {
				secrets[`${node.id}:${port}`] = value;
			}
		}
	}
	return secrets;
}

export function apply_secrets(
	wf: Workflow,
	secrets: WorkflowSecrets
): Workflow {
	if (Object.keys(secrets).length === 0) return wf;
	const restore = <T extends AnyNode>(node: T): T => {
		const data = { ...node.data };
		let found = false;
		for (const port of secret_ports(node)) {
			const stored = secrets[`${node.id}:${port}`];
			if (typeof stored === "string") {
				data[port] = stored;
				found = true;
			}
		}
		return found ? { ...node, data } : node;
	};
	return {
		...wf,
		references: wf.references.map(restore),
		operators: wf.operators.map(restore)
	};
}
