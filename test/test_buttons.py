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

        clear_event_trigger = demo.dependencies.pop()
        assert not clear_event_trigger["backend_fn"]
        assert clear_event_trigger["js"]
        assert clear_event_trigger["outputs"] == [textbox._id, chatbot._id]


class TestOAuthButtons:
    def test_login_button_warns_when_not_on_spaces(self):
        with pytest.warns(UserWarning):
            with gr.Blocks():
                gr.LoginButton()

    def test_logout_button_warns_when_not_on_spaces(self):
        with pytest.warns(UserWarning):
            with gr.Blocks():
                gr.LogoutButton()

    @patch("gradio.oauth.get_space", lambda: "fake_space")
    @patch("gradio.oauth._add_oauth_routes")
    def test_login_button_setup_correctly(self, mock_add_oauth_routes):
        with gr.Blocks() as demo:
            button = gr.LoginButton()

        login_event = demo.dependencies[0]
        assert login_event["targets"][0][1] == "click"
        assert not login_event["backend_fn"]  # No Python code
        assert login_event["js"]  # But JS code instead
        assert login_event["inputs"] == [button._id]
        assert login_event["outputs"] == []
