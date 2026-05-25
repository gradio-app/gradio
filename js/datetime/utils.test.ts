import { describe, test, expect } from "vitest";
import {
	format_date,
	date_is_valid_format,
	get_days_in_month,
	get_first_day_of_month,
	parse_date_value,
	generate_calendar_days,
	calculate_display_hour,
	convert_display_hour_to_24h
} from "./utils";

describe("format_date", () => {
	test("formats a date with time when include_time=true", () => {
		const date = new Date(2020, 9, 15, 12, 30, 45); // Oct 15, 2020 12:30:45
		expect(format_date(date, true)).toBe("2020-10-15 12:30:45");
	});

	test("formats a date without time when include_time=false", () => {
		const date = new Date(2020, 9, 15, 12, 30, 45);
		expect(format_date(date, false)).toBe("2020-10-15");
	});

	test("zero-pads month", () => {
		const date = new Date(2020, 2, 15, 12, 0, 0); // March (month 2, 0-indexed) = 03
		expect(format_date(date, false)).toBe("2020-03-15");
	});

	test("zero-pads day", () => {
		const date = new Date(2020, 0, 5, 12, 0, 0); // Jan 5
		expect(format_date(date, false)).toBe("2020-01-05");
	});

	test("zero-pads hours, minutes, seconds", () => {
		const date = new Date(2020, 0, 5, 9, 8, 7);
		expect(format_date(date, true)).toBe("2020-01-05 09:08:07");
	});

	test("returns empty string for an invalid Date", () => {
		const invalid = new Date("not a date");
		expect(format_date(invalid, true)).toBe("");
		expect(format_date(invalid, false)).toBe("");
	});
});

describe("date_is_valid_format", () => {
	test("null returns true", () => {
		expect(date_is_valid_format(null, true)).toBe(true);
		expect(date_is_valid_format(null, false)).toBe(true);
	});

	test("empty string returns true", () => {
		expect(date_is_valid_format("", true)).toBe(true);
		expect(date_is_valid_format("", false)).toBe(true);
	});

	test("valid datetime string with include_time=true", () => {
		expect(date_is_valid_format("2020-10-15 12:30:00", true)).toBe(true);
	});

	test("valid date-only string with include_time=false", () => {
		expect(date_is_valid_format("2020-10-15", false)).toBe(true);
	});

	test("'now' is valid for both include_time values", () => {
		expect(date_is_valid_format("now", true)).toBe(true);
		expect(date_is_valid_format("now", false)).toBe(true);
	});

	test("'now - 5d' is valid", () => {
		expect(date_is_valid_format("now - 5d", true)).toBe(true);
	});

	test("'now - 10m' is valid", () => {
		expect(date_is_valid_format("now - 10m", true)).toBe(true);
	});

	test("'now - 3h' is valid", () => {
		expect(date_is_valid_format("now - 3h", true)).toBe(true);
	});

	test("'now - 20s' is valid", () => {
		expect(date_is_valid_format("now - 20s", true)).toBe(true);
	});

	test("'now + 5m' is invalid (only subtraction is supported)", () => {
		expect(date_is_valid_format("now + 5m", true)).toBe(false);
	});

	test("arbitrary string is invalid", () => {
		expect(date_is_valid_format("not-a-date", true)).toBe(false);
	});

	test("US date format is invalid", () => {
		expect(date_is_valid_format("01/15/2020", true)).toBe(false);
	});

	test("datetime string is invalid when include_time=false", () => {
		expect(date_is_valid_format("2020-10-15 12:30:00", false)).toBe(false);
	});

	test("date-only string is invalid when include_time=true", () => {
		expect(date_is_valid_format("2020-10-15", true)).toBe(false);
	});
});

describe("get_days_in_month", () => {
	test("February in a leap year has 29 days", () => {
		expect(get_days_in_month(2020, 1)).toBe(29); // month 1 = February (0-indexed)
	});

	test("February in a non-leap year has 28 days", () => {
		expect(get_days_in_month(2021, 1)).toBe(28);
	});

	test("January has 31 days", () => {
		expect(get_days_in_month(2020, 0)).toBe(31);
	});

	test("April has 30 days", () => {
		expect(get_days_in_month(2020, 3)).toBe(30);
	});

	test("December has 31 days", () => {
		expect(get_days_in_month(2020, 11)).toBe(31);
	});
});

describe("get_first_day_of_month", () => {
	test("2020-01-01 is a Wednesday (day 3)", () => {
		expect(get_first_day_of_month(2020, 0)).toBe(3);
	});

	test("2020-03-01 is a Sunday (day 0)", () => {
		expect(get_first_day_of_month(2020, 2)).toBe(0);
	});

	test("2020-02-01 is a Saturday (day 6)", () => {
		expect(get_first_day_of_month(2020, 1)).toBe(6);
	});
});

describe("parse_date_value", () => {
	test("empty string falls back to current date", () => {
		const now = new Date();
		const result = parse_date_value("", true);
		expect(result.current_year).toBe(now.getFullYear());
		expect(result.current_month).toBe(now.getMonth());
	});

	test("parses a full datetime string correctly", () => {
		const result = parse_date_value("2020-10-15 12:30:45", true);
		expect(result.current_year).toBe(2020);
		expect(result.current_month).toBe(9); // October is index 9
		expect(result.selected_hour).toBe(12);
		expect(result.selected_minute).toBe(30);
		expect(result.selected_second).toBe(45);
		expect(result.is_pm).toBe(true);
	});

	test("parses a date-only string with include_time=false (time defaults to midnight)", () => {
		const result = parse_date_value("2020-10-15", false);
		expect(result.current_year).toBe(2020);
		expect(result.current_month).toBe(9);
		expect(result.selected_hour).toBe(0);
		expect(result.selected_minute).toBe(0);
		expect(result.selected_second).toBe(0);
	});

	test("midnight (00:00:00) is AM", () => {
		const result = parse_date_value("2020-01-01 00:00:00", true);
		expect(result.selected_hour).toBe(0);
		expect(result.is_pm).toBe(false);
	});

	test("noon (12:00:00) is PM", () => {
		const result = parse_date_value("2020-01-01 12:00:00", true);
		expect(result.selected_hour).toBe(12);
		expect(result.is_pm).toBe(true);
	});

	test("invalid string falls back to current date", () => {
		const now = new Date();
		const result = parse_date_value("garbage", true);
		expect(result.current_year).toBe(now.getFullYear());
		expect(result.current_month).toBe(now.getMonth());
	});
});

describe("generate_calendar_days", () => {
	test("always returns exactly 42 entries", () => {
		expect(generate_calendar_days(2020, 0).length).toBe(42); // January
		expect(generate_calendar_days(2020, 1).length).toBe(42); // February
		expect(generate_calendar_days(2020, 9).length).toBe(42); // October
	});

	test("all current-month days have is_current_month=true", () => {
		const days = generate_calendar_days(2020, 9); // October 2020
		const current_days = days.filter((d) => d.is_current_month);
		expect(current_days.length).toBe(31); // October has 31 days
		expect(current_days.every((d) => !d.is_next_month)).toBe(true);
	});

	test("days before the first of month are previous-month days", () => {
		// February 2020 starts on Saturday (day 6), so first 6 slots are prev-month
		const days = generate_calendar_days(2020, 1);
		const prev_month_days = days.filter(
			(d) => !d.is_current_month && !d.is_next_month
		);
		expect(prev_month_days.length).toBe(6);
	});

	test("days after the last of month are next-month days", () => {
		const days = generate_calendar_days(2020, 1);
		const next_month_days = days.filter((d) => d.is_next_month);
		// 42 total - 29 (Feb 2020 leap) - 6 (prev) = 7 next-month days
		expect(next_month_days.length).toBe(7);
	});

	test("March 2020 starts on Sunday so first entry is day 1 of current month", () => {
		const days = generate_calendar_days(2020, 2);
		expect(days[0].is_current_month).toBe(true);
		expect(days[0].day).toBe(1);
	});
});

describe("calculate_display_hour", () => {
	test("AM: hour 0 displays as 12 (midnight)", () => {
		expect(calculate_display_hour(0, false)).toBe(12);
	});

	test("AM: hour 1 displays as 1", () => {
		expect(calculate_display_hour(1, false)).toBe(1);
	});

	test("AM: hour 11 displays as 11", () => {
		expect(calculate_display_hour(11, false)).toBe(11);
	});

	test("PM: hour 12 displays as 12 (noon)", () => {
		expect(calculate_display_hour(12, true)).toBe(12);
	});

	test("PM: hour 13 displays as 1", () => {
		expect(calculate_display_hour(13, true)).toBe(1);
	});

	test("PM: hour 23 displays as 11", () => {
		expect(calculate_display_hour(23, true)).toBe(11);
	});
});

describe("convert_display_hour_to_24h", () => {
	test("AM: display 12 converts to 0 (midnight)", () => {
		expect(convert_display_hour_to_24h(12, false)).toBe(0);
	});

	test("AM: display 1 converts to 1", () => {
		expect(convert_display_hour_to_24h(1, false)).toBe(1);
	});

	test("AM: display 11 converts to 11", () => {
		expect(convert_display_hour_to_24h(11, false)).toBe(11);
	});

	test("PM: display 12 converts to 12 (noon)", () => {
		expect(convert_display_hour_to_24h(12, true)).toBe(12);
	});

	test("PM: display 1 converts to 13", () => {
		expect(convert_display_hour_to_24h(1, true)).toBe(13);
	});

	test("PM: display 11 converts to 23", () => {
		expect(convert_display_hour_to_24h(11, true)).toBe(23);
	});

	test("AM/PM round-trip: calculate_display_hour -> convert_display_hour_to_24h", () => {
		// Every valid 24h hour should survive a round-trip through display <-> 24h conversion
		for (let h = 0; h < 24; h++) {
			const is_pm = h >= 12;
			const display = calculate_display_hour(h, is_pm);
			const back = convert_display_hour_to_24h(display, is_pm);
			expect(back).toBe(h);
		}
	});
});
