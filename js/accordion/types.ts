export interface AccordionProps {
	open: boolean;
	height?: number | string | null;
	max_height?: number | string | null;
}

export interface AccordionEvents {
	expand: never;
	collapse: never;
	gradio_expand: never;
}
