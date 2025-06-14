export const format_date = (date: Date, include_time: boolean): string => {
	if (date.toJSON() === null) return "";
	const pad = (num: number): string => num.toString().padStart(2, "0");

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	const date_str = `${year}-${month}-${day}`;
	const time_str = `${hours}:${minutes}:${seconds}`;
	if (include_time) {
		return `${date_str} ${time_str}`;
	}
	return date_str;
};

export const date_is_valid_format = (
	date: string | null,
	include_time: boolean
): boolean => {
	if (date === null || date === "") return true;
	const valid_regex = include_time
		? /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
		: /^\d{4}-\d{2}-\d{2}$/;
	const is_valid_date = date.match(valid_regex) !== null;
	const is_valid_now =
		date.match(/^(?:\s*now\s*(?:-\s*\d+\s*[dmhs])?)?\s*$/) !== null;
	return is_valid_date || is_valid_now;
};

export const get_days_in_month = (year: number, month: number): number => {
	return new Date(year, month + 1, 0).getDate();
};

export const get_first_day_of_month = (year: number, month: number): number => {
	return new Date(year, month, 1).getDay();
};

export const parse_date_value = (
	entered_value: string,
	include_time: boolean
): {
	selected_date: Date;
	current_year: number;
	current_month: number;
	selected_hour: number;
	selected_minute: number;
	selected_second: number;
	is_pm: boolean;
} => {
	if (!entered_value || entered_value === "") {
		const now = new Date();
		return {
			selected_date: now,
			current_year: now.getFullYear(),
			current_month: now.getMonth(),
			selected_hour: now.getHours(),
			selected_minute: now.getMinutes(),
			selected_second: now.getSeconds(),
			is_pm: now.getHours() >= 12
		};
	}

	try {
		let date_to_parse = entered_value;
		if (!include_time && entered_value.match(/^\d{4}-\d{2}-\d{2}$/)) {
			date_to_parse += " 00:00:00";
		}

		const parsed = new Date(date_to_parse.replace(" ", "T"));
		if (!isNaN(parsed.getTime())) {
			return {
				selected_date: parsed,
				current_year: parsed.getFullYear(),
				current_month: parsed.getMonth(),
				selected_hour: parsed.getHours(),
				selected_minute: parsed.getMinutes(),
				selected_second: parsed.getSeconds(),
				is_pm: parsed.getHours() >= 12
			};
		}
	} catch (e) {
		// fallback to current date
	}

	const now = new Date();
	return {
		selected_date: now,
		current_year: now.getFullYear(),
		current_month: now.getMonth(),
		selected_hour: now.getHours(),
		selected_minute: now.getMinutes(),
		selected_second: now.getSeconds(),
		is_pm: now.getHours() >= 12
	};
};

export const generate_calendar_days = (
	current_year: number,
	current_month: number
): {
	day: number;
	is_current_month: boolean;
	is_next_month: boolean;
}[] => {
	const days_in_month = get_days_in_month(current_year, current_month);
	const first_day = get_first_day_of_month(current_year, current_month);
	const days = [];

	const prev_month = current_month === 0 ? 11 : current_month - 1;
	const prev_year = current_month === 0 ? current_year - 1 : current_year;
	const days_in_prev_month = get_days_in_month(prev_year, prev_month);

	for (let i = first_day - 1; i >= 0; i--) {
		days.push({
			day: days_in_prev_month - i,
			is_current_month: false,
			is_next_month: false
		});
	}

	for (let day = 1; day <= days_in_month; day++) {
		days.push({
			day,
			is_current_month: true,
			is_next_month: false
		});
	}

	const remaining_slots = 42 - days.length;
	for (let day = 1; day <= remaining_slots; day++) {
		days.push({
			day,
			is_current_month: false,
			is_next_month: true
		});
	}

	return days;
};

export const calculate_display_hour = (
	selected_hour: number,
	is_pm: boolean
): number => {
	return is_pm
		? selected_hour === 0
			? 12
			: selected_hour > 12
				? selected_hour - 12
				: selected_hour
		: selected_hour === 0
			? 12
			: selected_hour;
};

export const convert_display_hour_to_24h = (
	display_hour: number,
	is_pm: boolean
): number => {
	if (is_pm) {
		return display_hour === 12 ? 12 : display_hour + 12;
	}
	return display_hour === 12 ? 0 : display_hour;
};

export const month_names = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
