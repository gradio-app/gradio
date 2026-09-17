import { mount, unmount } from "svelte";
import Tooltip from "./Tooltip.svelte";

interface ActionArgs {
	color: string;
	text: string;
}

export function tooltip(
	element: HTMLElement | SVGElement,
	{ color, text }: ActionArgs
): any {
	let tooltip_component: Record<string, any> | null = null;
	const position = $state({ x: 0, y: 0 });

	function mouse_over(event: MouseEvent): MouseEvent {
		position.x = event.pageX;
		position.y = event.pageY;
		if (tooltip_component) return event;

		tooltip_component = mount(Tooltip, {
			props: {
				text,
				color,
				get x() {
					return position.x;
				},
				get y() {
					return position.y;
				}
			},
			target: document.body
		});

		return event;
	}
	function mouse_move(event: MouseEvent): void {
		position.x = event.pageX;
		position.y = event.pageY;
	}
	function mouse_leave(): void {
		if (!tooltip_component) return;
		unmount(tooltip_component);
		tooltip_component = null;
	}

	const el = element as HTMLElement;

	el.addEventListener("mouseover", mouse_over);
	el.addEventListener("mouseleave", mouse_leave);
	el.addEventListener("mousemove", mouse_move);

	return {
		destroy() {
			mouse_leave();
			el.removeEventListener("mouseover", mouse_over);
			el.removeEventListener("mouseleave", mouse_leave);
			el.removeEventListener("mousemove", mouse_move);
		}
	};
}
