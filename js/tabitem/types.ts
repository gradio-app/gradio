import type { SelectData } from "@gradio/utils";

export interface TabItemProps {
	elem_id: string;
	elem_classes: string[];
	label: string;
	id?: string | number | null;
	visible: boolean | "hidden";
	interactive: boolean;
	order: number;
	alignment?: "left" | "right";
	component_id: number;
}

export interface TabItemEvents {
	select: SelectData;
}
