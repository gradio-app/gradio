import Amuchina from "amuchina";

const should_open_link_in_new_tab = (link: string | null): boolean => {
	const href = link?.trim();
	return !!href && !href.startsWith("#");
};

// <style> elements and stylesheet <link>s apply to the whole document once
// injected, so drop them, matching the server-side sanitize-html defaults.
const configuration = Amuchina.getDefaultConfiguration();
configuration.allowElements = (configuration.allowElements ?? []).filter(
	(element: string) =>
		element !== "style" && element !== "svg:style" && element !== "link"
);

export function sanitize(source: string): string {
	const amuchina = new Amuchina(configuration);
	const node = new DOMParser().parseFromString(source, "text/html");
	const sanitized_node = amuchina.sanitize(node);
	walk_nodes(sanitized_node.body, "A", (node) => {
		if (node instanceof HTMLElement && "target" in node) {
			if (should_open_link_in_new_tab(node.getAttribute("href"))) {
				node.setAttribute("target", "_blank");
				node.setAttribute("rel", "noopener noreferrer");
			}
		}
	});

	return sanitized_node.body.innerHTML;
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
