from datetime import datetime, timezone

import gradio as gr


class TestDateTime:
    def test_component_functions(self):
        """
        Preprocess, postprocess
        """

        def within_range(time1, time2, delta=30):
            return abs(time1 - time2) < delta

        dt = gr.DateTime(timezone="US/Pacific")
        dt2 = gr.DateTime(timezone="Europe/Paris")
        dt3 = gr.DateTime(timezone="Europe/Paris", include_time=False)
        dt4 = gr.DateTime(timezone="US/Pacific", type="string")
        now = datetime.now().timestamp()
        assert dt.preprocess("2020-02-01 08:10:25") == 1580573425.0
        assert dt2.preprocess("2020-02-01 08:10:25") == 1580541025.0
        assert dt3.preprocess("2020-02-01") == 1580511600.0
        assert within_range(dt.preprocess("now"), now)
        assert not within_range(dt.preprocess("now - 1m"), now)
        assert within_range(dt2.preprocess("now"), now)
        assert within_range(dt.preprocess("now - 20s"), now - 20)
        assert within_range(dt2.preprocess("now - 20s"), now - 20)
        assert within_range(dt.preprocess("now - 10m"), now - 10 * 60)
        assert within_range(dt.preprocess("now - 3h"), now - 3 * 60 * 60)
        assert within_range(dt.preprocess("now - 12d"), now - 12 * 24 * 60 * 60)
        assert dt4.preprocess("2020-02-01 08:10:25") == "2020-02-01 08:10:25"
        assert len(dt4.preprocess("now - 10m")) == 19  # type: ignore

        assert dt.postprocess(1500000000) == "2017-07-13 19:40:00"
        assert dt2.postprocess(1500000000) == "2017-07-14 04:40:00"

    def test_can_pass_datetime_value(self):
        gr.DateTime(
            type="datetime",
            value=datetime.now(tz=timezone.utc),
        )

    def test_in_interface(self):
        """
        Interface, process
        """
        dt = gr.DateTime(timezone="US/Pacific")
        iface = gr.Interface(lambda x: x, dt, "number")
        assert iface("2017-07-13 19:40:00") == 1500000000
