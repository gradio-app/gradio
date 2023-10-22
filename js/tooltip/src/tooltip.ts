// import type { ActionReturn } from "@gradio/tootils";
import Tooltip from "./Tooltip.svelte";

interface ActionArgs {
	color: string;
	text: string;
}

export function tooltip(
	element: HTMLElement | SVGElement,
	{ color, text }: ActionArgs
): any {
	let tooltipComponent: Tooltip;
	function mouse_over(event: MouseEvent): MouseEvent {
		tooltipComponent = new Tooltip({
			props: {
				text,
				x: event.pageX,
				y: event.pageY,
				color
			},
			target: document.body
		});

		return event;
	}
	function mouseMove(event: MouseEvent): void {
		tooltipComponent.$set({
			x: event.pageX,
			y: event.pageY
		});
	}
	function mouseLeave(): void {
		tooltipComponent.$destroy();
	}

	const el = element as HTMLElement;

	el.addEventListener("mouseover", mouse_over);
	el.addEventListener("mouseleave", mouseLeave);
	el.addEventListener("mousemove", mouseMove);

	return {
		destroy() {
			el.removeEventListener("mouseover", mouse_over);
			el.removeEventListener("mouseleave", mouseLeave);
			el.removeEventListener("mousemove", mouseMove);
		}
	};
}
