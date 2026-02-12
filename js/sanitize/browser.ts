import Amuchina from "amuchina";

const is_external_url = (
	link: string | null,
	root = location.href
): boolean => {
	try {
		return !!link && new URL(link).origin !== new URL(root).origin;
	} catch (e) {
		return false;
	}
};

export function sanitize(source: string): string {
	const amuchina = new Amuchina();
	const node = new DOMParser().parseFromString(source, "text/html");
	walk_nodes(node.body, "A", (node) => {
		if (node instanceof HTMLElement && "target" in node) {
			if (is_external_url(node.getAttribute("href"), location.href)) {
				node.setAttribute("target", "_blank");
				node.setAttribute("rel", "noopener noreferrer");
			}
		}
	});

	return amuchina.sanitize(node).body.innerHTML;
}

function walk_nodes(
	node: Node | null | HTMLElement,
	test: string | ((node: Node | HTMLElement) => boolean),
	callback: (node: Node | HTMLElement) => void
): void {
	if (
		node &&
		((typeof test === "string" && node.nodeName === test) ||
			(typeof test === "function" && test(node)))
	) {
		callback(node);
	}
	const children = node?.childNodes || [];
	for (let i = 0; i < children.length; i++) {
		// @ts-ignore
		walk_nodes(children[i], test, callback);
	}
}
