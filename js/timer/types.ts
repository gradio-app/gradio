export interface TimerProps {
	value: number;
	active: boolean;
}

export interface TimerEvents {
	change: never;
	tick: never;
	clear_status: never;
}
