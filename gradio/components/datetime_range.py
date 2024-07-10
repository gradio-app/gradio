"""gr.DateTimeRange() component."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, Literal, cast

import pytz
from gradio_client.documentation import document

from gradio.components.base import FormComponent
from gradio.events import Events, SelectData, on
from gradio.helpers import skip

if TYPE_CHECKING:
    from gradio.components import LinePlot


@document()
class DateTimeRange(FormComponent):
    """
    Component to select a start and end date. Useful for filtering graphs or data by time range.
    """

    EVENTS = [
        Events.change,
        Events.submit,
    ]

    def __init__(
        self,
        value: tuple[float | str | datetime, float | str | datetime] | None = None,
        *,
        include_time: bool = True,
        type: Literal["timestamp", "datetime", "string"] = "timestamp",
        timezone: str | None = None,
        quick_ranges: list[str] | None = None,
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
            value: default value for date range. Should be a tuple of start and end times represented as: numbers representing seconds since epoch; datetime objects; strings in "YYYY-MM-DD HH:MM:SS" format.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label. If False, the copy button is hidden as well as well as the label.
            include_time: If True, the component will include time selection. If False, only date selection will be available.
            type: The type of the value. Can be "timestamp", "datetime", or "string". If "timestamp", the value will be a tuple of two numbers representing the start and end date in seconds since epoch. If "datetime", the value will be a tuple of two datetime objects. If "string", the value will be the date entered by the user.
            timezone: The timezone to use for timestamps, such as "US/Pacific" or "Europe/Paris". If None, the timezone will be the local timezone.
            quick_ranges: List of strings representing quick ranges to display, such as ["30s", "1h", "24h", "7d"]. Set to [] to clear.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.quick_ranges = (
            ["15m", "1h", "24h"] if quick_ranges is None else quick_ranges
        )
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

    def preprocess(
        self, payload: tuple[str, str] | None
    ) -> tuple[str, str] | tuple[float, float] | tuple[datetime, datetime] | None:
        """
        Parameters:
            payload: the text entered in the textarea.
        Returns:
            Passes text value as a {str} into the function.
        """
        if payload is None or "" in payload:
            return None
        if self.type == "string":
            return payload
        datetime_tuple = (
            self.get_datetime_from_str(payload[0]),
            self.get_datetime_from_str(payload[1]),
        )
        if self.type == "datetime":
            return datetime_tuple
        elif self.type == "timestamp":
            return (datetime_tuple[0].timestamp(), datetime_tuple[1].timestamp())

    def postprocess(
        self, value: tuple[float | datetime | str, float | datetime | str] | None
    ) -> tuple[str, str] | None:
        """
        Parameters:
            value: Expects a tuple pair of datetimes.
        Returns:
            A tuple pair of timestamps.
        """
        if value is None:
            return None

        def parse_item(item: float | datetime | str) -> str:
            if isinstance(item, datetime):
                return datetime.strftime(item, self.time_format)
            elif isinstance(item, str):
                return item
            else:
                return datetime.fromtimestamp(item).strftime(self.time_format)

        return (parse_item(value[0]), parse_item(value[1]))

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    def example_payload(self) -> tuple[float, float]:
        return (1609459200, 1612137600)

    def example_value(self) -> tuple[float, float]:
        return (1609459200, 1612137600)

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
                dt = dt.replace(tzinfo=pytz.timezone(self.timezone))
            return dt

    def bind(self, plots: LinePlot | list[LinePlot]) -> None:
        from gradio.components import LinePlot

        if not isinstance(plots, list):
            plots = [plots]
        plot_count = len(plots)

        def reset_range(select: SelectData):
            if select.selected:
                a, b = cast("tuple[float, float]", select.index)
                dt_a, dt_b = datetime.fromtimestamp(a), datetime.fromtimestamp(b)
                return dt_a, dt_b
            else:
                return skip()

        on([plot.select for plot in plots], reset_range, None, self)

        def update_plots(domain: tuple[int, int]):
            changes = [
                LinePlot(x_lim=[domain[0] * 1000, domain[1] * 1000])
                for _ in range(plot_count)
            ]
            return changes if len(changes) > 1 else changes[0]

        self.change(update_plots, self, plots)  # type: ignore
