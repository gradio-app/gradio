import type { SelectData } from "@gradio/utils";

export interface DatasetProps {
	components: string[];
	component_props: Record<string, any>[];
	headers: string[];
	samples: any[][] | null;
	sample_labels: string[] | null;
	value: number | null;
	root: string;
	proxy_url: null | string;
	samples_per_page: number;

	layout: "gallery" | "table" | null;
}

export interface DatasetEvents {
	click: never;
	select: SelectData;
}
