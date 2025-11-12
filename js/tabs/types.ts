import type { SelectData } from "@gradio/utils";
import type { Tab } from "./shared/Tabs.svelte";

export interface TabsProps {
	visible: boolean | "hidden";
	elem_id: string;
	elem_classes: string[];
	selected: number | string;
	initial_tabs: Tab[];
	name: "tabs" | "walkthrough";
}

export interface TabsEvents {
	change: never;
	select: SelectData;
}
