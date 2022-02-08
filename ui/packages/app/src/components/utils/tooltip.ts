import Tooltip from "./Tooltip.svelte";

interface ActionArgs {
	color: string;
	text: string;
}

export function tooltip(element: HTMLElement, { color, text }: ActionArgs) {
	let tooltipComponent: Tooltip;
	function mouseOver(event: MouseEvent) {
		tooltipComponent = new Tooltip({
			props: {
				text,
				x: event.pageX,
				y: event.pageY,
				color
			},
			target: document.body
		});
	}
	function mouseMove(event: MouseEvent) {
		tooltipComponent.$set({
			x: event.pageX,
			y: event.pageY
		});
	}
	function mouseLeave() {
		tooltipComponent.$destroy();
	}

	element.addEventListener("mouseover", mouseOver);
	element.addEventListener("mouseleave", mouseLeave);
	element.addEventListener("mousemove", mouseMove);

	return {
		destroy() {
			element.removeEventListener("mouseover", mouseOver);
			element.removeEventListener("mouseleave", mouseLeave);
			element.removeEventListener("mousemove", mouseMove);
		}
	};
}
