"""Tests for gr.Timeline() component."""

import pytest
from gradio.components import Timeline


class TestTimelineInit:
    def test_timeline_default_values(self):
        timeline = Timeline()
        assert timeline.value is None
        assert timeline.layout == "vertical"

    def test_timeline_with_value(self):
        value = [
            {"title": "Event 1", "status": "completed"},
            {"title": "Event 2", "status": "in-progress"},
        ]
        timeline = Timeline(value=value)
        assert timeline.value == value
        assert timeline.layout == "vertical"

    def test_timeline_horizontal_layout(self):
        timeline = Timeline(layout="horizontal")
        assert timeline.layout == "horizontal"


class TestTimelinePreprocess:
    def test_preprocess_none(self):
        timeline = Timeline()
        assert timeline.preprocess(None) is None

    def test_preprocess_list(self):
        timeline = Timeline()
        value = [
            {"title": "Event 1", "status": "completed"},
            {"title": "Event 2", "status": "pending"},
        ]
        result = timeline.preprocess(value)
        assert result == value


class TestTimelinePostprocess:
    def test_postprocess_none(self):
        timeline = Timeline()
        assert timeline.postprocess(None) is None

    def test_postprocess_list(self):
        timeline = Timeline()
        value = [
            {"title": "Event 1", "status": "completed"},
            {"title": "Event 2", "status": "error"},
        ]
        result = timeline.postprocess(value)
        assert result == value


class TestTimelineProcessExample:
    def test_process_example_none(self):
        timeline = Timeline()
        assert timeline.process_example(None) == ""

    def test_process_example_empty_list(self):
        timeline = Timeline()
        assert timeline.process_example([]) == ""

    def test_process_example_with_events(self):
        timeline = Timeline()
        value = [
            {"title": "Event 1"},
            {"title": "Event 2"},
            {"title": "Event 3"},
        ]
        assert timeline.process_example(value) == "3 events"


class TestTimelineExamplePayload:
    def test_example_payload(self):
        timeline = Timeline()
        payload = timeline.example_payload()
        assert isinstance(payload, list)
        assert len(payload) > 0
        assert "title" in payload[0]
        assert "status" in payload[0]


class TestTimelineExampleValue:
    def test_example_value(self):
        timeline = Timeline()
        value = timeline.example_value()
        assert isinstance(value, list)
        assert len(value) > 0
        assert "title" in value[0]
