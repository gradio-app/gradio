import gradio as gr


def test_tabs_overflow_behavior_is_in_config():
    assert gr.Tabs().get_config()["overflow_behavior"] == "menu"
    assert gr.Tabs(overflow_behavior="wrap").get_config()["overflow_behavior"] == "wrap"


def test_tab_alignment_is_in_config():
    assert gr.Tab("Settings").get_config()["alignment"] == "left"
    assert gr.Tab("Settings", alignment="right").get_config()["alignment"] == "right"
