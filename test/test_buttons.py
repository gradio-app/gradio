from unittest.mock import patch

import pytest

import gradio as gr


class TestClearButton:
    def test_clear_event_setup_correctly(self):
        with gr.Blocks() as demo:
            chatbot = gr.Chatbot([["Hello", "How are you?"]])
            with gr.Row():
                textbox = gr.Textbox(scale=3, interactive=True)
                gr.ClearButton([textbox, chatbot], scale=1)

        clear_event_trigger = demo.fns.pop(demo.default_config.fn_id - 1)
        assert not clear_event_trigger.fn
        assert clear_event_trigger.js
        assert clear_event_trigger.outputs == [textbox, chatbot]

    def test_clear_event_setup_correctly_with_state(self):
        with gr.Blocks() as demo:
            chatbot = gr.Chatbot([["Hello", "How are you?"]])
            state = gr.State("")
            gr.ClearButton([state, chatbot], scale=1)

        clear_event_trigger_state = demo.fns.pop(demo.default_config.fn_id - 1)
        assert clear_event_trigger_state.fn


class TestOAuthButtons:
    @pytest.mark.flaky
    def test_login_button_warns_when_not_on_spaces(self):
        with pytest.warns(UserWarning):
            with gr.Blocks():
                gr.LoginButton()

    @patch("gradio.oauth.get_space", lambda: "fake_space")
    @patch("gradio.oauth._add_oauth_routes")
    def test_login_button_setup_correctly(self, mock_add_oauth_routes):
        with gr.Blocks() as demo:
            button = gr.LoginButton()

        login_event = demo.fns[0]
        assert login_event.targets[0][1] == "click"
        assert not login_event.fn  # No Python code
        assert login_event.js  # But JS code instead
        assert login_event.inputs == [button]
        assert login_event.outputs == []
