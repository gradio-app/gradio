"""gr.DateTime() component."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Literal

import pytz
from gradio_client.documentation import document

from gradio.components.base import FormComponent
from gradio.events import Events


@document()
class DateTime(FormComponent):
    """
    Component to select a date and (optionally) a time.
    """

    EVENTS = [
        Events.change,
        Events.submit,
    ]

    def __init__(
        self,
        value: float | str | datetime | None = None,
        *,
        include_time: bool = True,
        type: Literal["timestamp", "datetime", "string"] = "timestamp",
        timezone: str | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        info: str | None = None,
        every: float | None = None,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        """
        Parameters:
            value: default value for datetime.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label.
            include_time: If True, the component will include time selection. If False, only date selection will be available.
            type: The type of the value. Can be "timestamp", "datetime", or "string". If "timestamp", the value will be a number representing the start and end date in seconds since epoch. If "datetime", the value will be a datetime object. If "string", the value will be the date entered by the user.
            timezone: The timezone to use for timestamps, such as "US/Pacific" or "Europe/Paris". If None, the timezone will be the local timezone.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        super().__init__(
            every=every,
            scale=scale,
            min_width=min_width,
            visible=visible,
            label=label,
            show_label=show_label,
            info=info,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
        )
        self.type = type
        self.include_time = include_time
        self.time_format = "%Y-%m-%d %H:%M:%S" if include_time else "%Y-%m-%d"
        self.timezone = timezone

    def preprocess(self, payload: str | None) -> str | float | datetime | None:
        """
        Parameters:
            payload: the text entered in the textarea.
        Returns:
            Passes text value as a {str} into the function.
        """
        if payload is None or payload == "":
            return None
        if self.type == "string" and "now" not in payload:
            return payload
        datetime = self.get_datetime_from_str(payload)
        if self.type == "string":
            return datetime.strftime(self.time_format)
        if self.type == "datetime":
            return datetime
        elif self.type == "timestamp":
            return datetime.timestamp()

    def postprocess(self, value: float | datetime | str | None) -> str | None:
        """
        Parameters:
            value: Expects a tuple pair of datetimes.
        Returns:
            A tuple pair of timestamps.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return datetime.strftime(value, self.time_format)
        elif isinstance(value, str):
            return value
        else:
            return datetime.fromtimestamp(
                value, tz=pytz.timezone(self.timezone) if self.timezone else None
            ).strftime(self.time_format)

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "string",
            "description": f"Formatted as YYYY-MM-DD{' HH:MM:SS' if self.include_time else ''}",
        }

    def example_payload(self) -> str:
        return "2020-10-01 05:20:15"

    def example_value(self) -> str:
        return "2020-10-01 05:20:15"

    def get_datetime_from_str(self, date: str) -> datetime:
        now_regex = r"^(?:\s*now\s*(?:-\s*(\d+)\s*([dmhs]))?)?\s*$"

        if "now" in date:
            match = re.match(now_regex, date)
            if match:
                num = int(match.group(1) or 0)
                unit = match.group(2) or "s"
                if unit == "d":
                    delta = timedelta(days=num)
                elif unit == "h":
                    delta = timedelta(hours=num)
                elif unit == "m":
                    delta = timedelta(minutes=num)
                else:
                    delta = timedelta(seconds=num)
                return datetime.now() - delta
            else:
                raise ValueError("Invalid 'now' time format")
        else:
            dt = datetime.strptime(date, self.time_format)
            if self.timezone:
                dt = pytz.timezone(self.timezone).localize(dt)
            return dt
