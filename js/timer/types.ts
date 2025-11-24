export interface TimerProps {
	value: number;
	active: boolean;
}

export interface TimerEvents {
	tick: never;
	clear_status: never;
}
