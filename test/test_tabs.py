import gradio as gr


def test_tabs_overflow_behavior_is_in_config():
    assert gr.Tabs().get_config()["overflow_behavior"] == "menu"
    assert gr.Tabs(overflow_behavior="wrap").get_config()["overflow_behavior"] == "wrap"
