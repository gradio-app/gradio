export interface DateTimeProps {
	value: string;
	include_time: boolean;
	type: "timestamp" | "datetime" | "string";
	timezone: string | null;
	info: string;
}

export interface DateTimeEvents {
	change: never;
	submit: never;
}
