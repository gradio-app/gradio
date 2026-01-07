export interface ParamViewerProps {
	value: Record<
		string,
		{
			type: string;
			description: string;
			default: string;
		}
	>;
	linkify: string[];
	header: string | null;
	anchor_links: boolean | string;
	max_height: number | string | undefined;
	collapsed: boolean;
}

export interface ParamViewerEvents {
	change: never;
	upload: never;
	clear_status: never;
}
