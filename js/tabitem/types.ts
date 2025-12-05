import type { SelectData } from "@gradio/utils";

export interface TabItemProps {
	elem_id: string;
	elem_classes: string[];
	label: string;
	id: string | number;
	visible: boolean | "hidden";
	interactive: boolean;
	order: number;
	scale: number;
	component_id: number;
}

export interface TabItemEvents {
	select: SelectData;
}
