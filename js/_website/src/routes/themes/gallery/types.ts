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
	colors: {
		primary: string;
		secondary: string;
		neutral: string;
		background: string;
		background_dark: string;
	};
	fonts: {
		main: string;
		mono: string;
	};
};
