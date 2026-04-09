from datetime import datetime, timezone
from typing import cast

import pytest

import gradio as gr


def within_range(time1, time2, delta=30):
    return abs(time1 - time2) < delta


class TestDateTimePreprocess:
    def test_preprocess_returns_none_for_empty_inputs(self):
        """None, empty string, and whitespace-only all return None."""
        dt = gr.DateTime(timezone="US/Pacific")
        assert dt.preprocess(None) is None
        assert dt.preprocess("") is None
        # Bug fix: whitespace-only used to raise ValueError
        assert dt.preprocess("   ") is None
        assert dt.preprocess("\t") is None

    def test_preprocess_timestamp_type_with_timezone(self):
        """Date strings are localized to the given timezone before converting to epoch."""
        dt_pacific = gr.DateTime(timezone="US/Pacific")
        dt_paris = gr.DateTime(timezone="Europe/Paris")
        dt_paris_date_only = gr.DateTime(timezone="Europe/Paris", include_time=False)

        assert dt_pacific.preprocess("2020-02-01 08:10:25") == 1580573425.0
        assert dt_paris.preprocess("2020-02-01 08:10:25") == 1580541025.0
        assert dt_paris_date_only.preprocess("2020-02-01") == 1580511600.0

    def test_preprocess_timestamp_type_no_timezone(self):
        """Without a timezone the result is a float (local-time interpretation)."""
        dt = gr.DateTime()
        result = dt.preprocess("2020-02-01 08:10:25")
        assert isinstance(result, float)

    def test_preprocess_datetime_type_returns_datetime_object(self):
        """type='datetime' returns a Python datetime for both a date string and 'now'."""
        dt = gr.DateTime(type="datetime", timezone="US/Pacific")
        result = dt.preprocess("2020-02-01 08:10:25")
        assert isinstance(result, datetime)
        assert result.year == 2020
        assert result.month == 2
        assert result.day == 1
        assert result.hour == 8
        assert result.minute == 10
        assert result.second == 25

        result_now = dt.preprocess("now")
        assert isinstance(result_now, datetime)
        assert within_range(result_now.timestamp(), datetime.now().timestamp(), delta=5)

    def test_preprocess_string_type_passthrough(self):
        """type='string' returns the raw string for non-'now' values."""
        dt = gr.DateTime(type="string", timezone="US/Pacific")
        assert dt.preprocess("2020-02-01 08:10:25") == "2020-02-01 08:10:25"

    def test_preprocess_string_type_now_returns_formatted_string(self):
        """type='string' with 'now' patterns returns a formatted datetime string."""
        dt = gr.DateTime(type="string", timezone="US/Pacific")
        result = dt.preprocess("now - 10m")
        assert isinstance(result, str)
        assert len(result) == 19  # "YYYY-MM-DD HH:MM:SS"

    def test_preprocess_now_keyword(self):
        """'now' returns the current timestamp, within tolerance."""
        dt = gr.DateTime(timezone="US/Pacific")
        dt2 = gr.DateTime(timezone="Europe/Paris")
        now = datetime.now().timestamp()

        assert within_range(dt.preprocess("now"), now)
        assert within_range(dt2.preprocess("now"), now)

    def test_preprocess_now_minus_seconds(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        assert within_range(dt.preprocess("now - 20s"), now - 20)
        # Use 60s (> default 30s tolerance) to verify the offset is real
        assert not within_range(dt.preprocess("now - 60s"), now)

    def test_preprocess_now_minus_minutes(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        assert within_range(dt.preprocess("now - 10m"), now - 10 * 60)
        assert not within_range(dt.preprocess("now - 1m"), now)

    def test_preprocess_now_minus_hours(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        assert within_range(dt.preprocess("now - 3h"), now - 3 * 60 * 60)

    def test_preprocess_now_minus_days(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        assert within_range(dt.preprocess("now - 12d"), now - 12 * 24 * 60 * 60)

    def test_preprocess_invalid_now_raises(self):
        """Malformed 'now' expressions raise ValueError."""
        dt = gr.DateTime(timezone="US/Pacific")
        with pytest.raises(ValueError):
            dt.preprocess("now + 5m")
        with pytest.raises(ValueError):
            dt.preprocess("now - abc")


class TestDateTimePostprocess:
    def test_postprocess_none_returns_none(self):
        dt = gr.DateTime(timezone="US/Pacific")
        assert dt.postprocess(None) is None

    def test_postprocess_datetime_object(self):
        """datetime objects are formatted using time_format (timezone ignored)."""
        dt = gr.DateTime(timezone="US/Pacific")
        result = dt.postprocess(datetime(2020, 2, 1, 8, 10, 25))
        assert result == "2020-02-01 08:10:25"

    def test_postprocess_datetime_object_date_only(self):
        """include_time=False formats without time component."""
        dt = gr.DateTime(timezone="US/Pacific", include_time=False)
        result = dt.postprocess(datetime(2020, 2, 1, 8, 10, 25))
        assert result == "2020-02-01"

    def test_postprocess_string_passthrough(self):
        """String values are returned unchanged."""
        dt = gr.DateTime(timezone="US/Pacific")
        assert dt.postprocess("2020-02-01 08:10:25") == "2020-02-01 08:10:25"

    def test_postprocess_timestamp_with_pacific_timezone(self):
        dt = gr.DateTime(timezone="US/Pacific")
        assert dt.postprocess(1500000000) == "2017-07-13 19:40:00"

    def test_postprocess_timestamp_with_paris_timezone(self):
        dt = gr.DateTime(timezone="Europe/Paris")
        assert dt.postprocess(1500000000) == "2017-07-14 04:40:00"

    def test_postprocess_datetime_with_utc_timezone(self):
        """datetime objects with timezone info are formatted as-is."""
        dt = gr.DateTime(type="datetime", timezone="US/Pacific")
        utc_dt = datetime(2020, 2, 1, 8, 10, 25, tzinfo=timezone.utc)
        result = dt.postprocess(utc_dt)
        assert result == "2020-02-01 08:10:25"


class TestGetDatetimeFromStr:
    def test_parses_regular_datetime_string(self):
        dt = gr.DateTime(timezone="US/Pacific")
        result = dt.get_datetime_from_str("2020-02-01 08:10:25")
        assert result.year == 2020
        assert result.month == 2
        assert result.day == 1
        assert result.hour == 8
        assert result.minute == 10
        assert result.second == 25

    def test_parses_date_only_string(self):
        dt = gr.DateTime(timezone="Europe/Paris", include_time=False)
        result = dt.get_datetime_from_str("2020-02-01")
        assert result.year == 2020
        assert result.month == 2
        assert result.day == 1

    def test_applies_timezone_to_parsed_string(self):
        import pytz

        dt = gr.DateTime(timezone="US/Pacific")
        result = dt.get_datetime_from_str("2020-02-01 08:10:25")
        assert result.tzinfo is not None
        assert cast(pytz.BaseTzInfo, result.tzinfo).zone == "US/Pacific"

    def test_now_returns_current_time(self):
        dt = gr.DateTime(timezone="US/Pacific")
        result = dt.get_datetime_from_str("now")
        assert within_range(result.timestamp(), datetime.now().timestamp(), delta=5)

    def test_now_minus_seconds_delta(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        result = dt.get_datetime_from_str("now - 30s")
        assert within_range(result.timestamp(), now - 30)

    def test_now_minus_minutes_delta(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        result = dt.get_datetime_from_str("now - 5m")
        assert within_range(result.timestamp(), now - 300)

    def test_now_minus_hours_delta(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        result = dt.get_datetime_from_str("now - 2h")
        assert within_range(result.timestamp(), now - 7200)

    def test_now_minus_days_delta(self):
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        result = dt.get_datetime_from_str("now - 7d")
        assert within_range(result.timestamp(), now - 7 * 86400)

    def test_invalid_now_format_raises(self):
        dt = gr.DateTime(timezone="US/Pacific")
        with pytest.raises(ValueError, match="Invalid 'now' time format"):
            dt.get_datetime_from_str("now + 5m")

    def test_now_no_space_around_minus(self):
        """'now-5m' (no spaces) is actually valid: the regex uses \\s* (zero or more spaces)."""
        dt = gr.DateTime(timezone="US/Pacific")
        now = datetime.now().timestamp()
        # The regex allows zero spaces around '-', so "now-5m" works just like "now - 5m"
        result = dt.get_datetime_from_str("now-5m")
        assert within_range(result.timestamp(), now - 5 * 60)


class TestDateTimeApiInfo:
    def test_api_info_with_time(self):
        dt = gr.DateTime(include_time=True)
        info = dt.api_info()
        assert info["type"] == "string"
        assert "YYYY-MM-DD HH:MM:SS" in info["description"]

    def test_api_info_date_only(self):
        dt = gr.DateTime(include_time=False)
        info = dt.api_info()
        assert info["type"] == "string"
        assert "YYYY-MM-DD" in info["description"]
        assert "HH:MM:SS" not in info["description"]


class TestDateTimeExampleValues:
    def test_example_payload(self):
        dt = gr.DateTime()
        assert dt.example_payload() == "2020-10-01 05:20:15"

    def test_example_value(self):
        dt = gr.DateTime()
        assert dt.example_value() == "2020-10-01 05:20:15"

    def test_example_values_include_time_regardless_of_setting(self):
        """Discrepancy: example values always include time even when include_time=False."""
        dt = gr.DateTime(include_time=False)
        # These return the full datetime string regardless of include_time
        assert dt.example_payload() == "2020-10-01 05:20:15"
        assert dt.example_value() == "2020-10-01 05:20:15"


class TestDateTimeInterface:
    def test_in_interface_timestamp_type(self):
        dt = gr.DateTime(timezone="US/Pacific")
        iface = gr.Interface(lambda x: x, dt, "number")
        assert iface("2017-07-13 19:40:00") == 1500000000

    def test_in_interface_datetime_type(self):
        """type='datetime' preprocess returns a datetime; Interface with 'text' output
        then postprocesses it to a string (timezone-aware formatted string)."""
        dt = gr.DateTime(type="datetime", timezone="US/Pacific")
        iface = gr.Interface(lambda x: x, dt, "text")
        result = iface("2020-02-01 08:10:25")
        # The datetime is postprocessed by the text output, yielding a string
        assert isinstance(result, str)
        assert "2020-02-01" in result

    def test_can_pass_datetime_value_on_construction(self):
        """datetime objects with timezone info are accepted as default values."""
        gr.DateTime(
            type="datetime",
            value=datetime.now(tz=timezone.utc),
        )
