export interface NavbarProps {
	value: [string, string][] | null;
	main_page_name: string | false;
}

export interface NavbarEvents {
	change: never;
	clear_status: never;
}
