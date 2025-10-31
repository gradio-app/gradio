export interface SidebarProps {
	open: boolean;
	position: "left" | "right";
	width: number | string;
}

export interface SidebarEvents {
	expand: never;
	collapse: never;
	clear_status: never;
}
