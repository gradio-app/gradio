export type ThemeStatus =
	| "RUNNING"
	| "BUILDING"
	| "BUILD_ERROR"
	| "RUNTIME_ERROR"
	| "PAUSED"
	| "SLEEPING"
	| "STOPPED"
	| "NO_APP_FILE"
	| "UNKNOWN";

export type ThemeData = {
	id: string;
	name: string;
	author: string;
	description: string;
	is_official: boolean;
	likes: number;
	hf_space_id: string;
	subdomain: string;
	background_color: string;
	status: ThemeStatus;
	colors: {
		primary: string;
		secondary: string;
		neutral: string;
		background: string;
		background_dark: string;
		block_background: string;
		block_border: string;
		text_color: string;
		button_primary: string;
		button_secondary_border: string;
		button_secondary_text: string;
	};
	fonts: {
		main: string;
		mono: string;
	};
	stylesheets?: string[];
};

export type HfSpaceEntry = {
	id: string;
	likes: number;
	subdomain: string;
	runtime?: {
		stage?: string;
	};
	cardData?: {
		title?: string;
		short_description?: string;
		colorFrom?: string;
		colorTo?: string;
	};
};
