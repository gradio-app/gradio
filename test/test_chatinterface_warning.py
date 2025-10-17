"""Test for ChatInterface textbox parameter conflict warnings."""

import warnings
import pytest
import gradio as gr


def chat(message, history):
    return f"Echo: {message}"


class TestTextboxParameterConflicts:
    """Test that warnings are shown for conflicting textbox parameters."""

    def test_warning_with_custom_textbox_and_submit_btn(self):
        """Should warn when submit_btn is set on ChatInterface with custom Textbox."""
        with pytest.warns(UserWarning, match="submit_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                type="messages",
                textbox=gr.Textbox(placeholder="Custom textbox"),
                submit_btn="submit",  # This conflicts!
            )

    def test_warning_with_custom_textbox_and_stop_btn(self):
        """Should warn when stop_btn is set on ChatInterface with custom Textbox."""
        with pytest.warns(UserWarning, match="stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                type="messages",
                textbox=gr.Textbox(placeholder="Custom textbox"),
                stop_btn="Stop",  # This conflicts!
            )

    def test_warning_with_multiple_conflicts(self):
        """Should warn about all conflicting parameters."""
        with pytest.warns(UserWarning, match="submit_btn.*stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                type="messages",
                textbox=gr.Textbox(placeholder="Custom textbox"),
                submit_btn="Send",
                stop_btn="Stop",
            )

    def test_no_warning_when_params_set_on_textbox(self):
        """Should NOT warn when params are correctly set on the textbox itself."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            # This should not raise any warning
            gr.ChatInterface(
                chat,
                type="messages",
                textbox=gr.Textbox(
                    placeholder="Custom textbox", submit_btn="submit"  # Correct usage!
                ),
            )

    def test_no_warning_without_custom_textbox(self):
        """Should NOT warn when using default textbox with ChatInterface params."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            # This should not raise any warning
            gr.ChatInterface(
                chat,
                type="messages",
                submit_btn="Submit",  # This is fine without custom textbox
            )

    def test_no_warning_when_textbox_already_has_matching_value(self):
        """Should NOT warn if textbox already has the same value as ChatInterface param."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            # Textbox has submit_btn="Send", ChatInterface also says submit_btn="Send"
            # No conflict, so no warning
            gr.ChatInterface(
                chat,
                type="messages",
                textbox=gr.Textbox(placeholder="Test", submit_btn="Send"),
                submit_btn="Send",  # Same value, no conflict
            )

    def test_warning_with_multimodal_textbox(self):
        """Should warn for MultimodalTextbox conflicts too."""
        with pytest.warns(UserWarning, match="stop_btn.*will be ignored"):
            gr.ChatInterface(
                chat,
                type="messages",
                multimodal=True,
                textbox=gr.MultimodalTextbox(placeholder="Custom"),
                stop_btn="Stop",  # Conflicts!
            )

    def test_no_warning_multimodal_with_correct_usage(self):
        """Should NOT warn when MultimodalTextbox params are set correctly."""
        with warnings.catch_warnings():
            warnings.simplefilter("error")
            gr.ChatInterface(
                chat,
                type="messages",
                multimodal=True,
                textbox=gr.MultimodalTextbox(
                    placeholder="Custom", stop_btn="Stop"  # Correct!
                ),
            )
