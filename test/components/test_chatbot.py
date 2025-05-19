from pathlib import Path

import gradio as gr
from gradio import utils


class TestChatbot:
    def test_component_functions(self):
        """
        Postprocess, get_config
        """
        chatbot = gr.Chatbot()
        assert chatbot.postprocess(
            [["You are **cool**\nand fun", "so are *you*"]]
        ).model_dump() == [("You are **cool**\nand fun", "so are *you*")]

        multimodal_msg = [
            [("test/test_files/video_sample.mp4",), "cool video"],
            [("test/test_files/audio_sample.wav",), "cool audio"],
            [("test/test_files/bus.png", "A bus"), "cool pic"],
            [(Path("test/test_files/video_sample.mp4"),), "cool video"],
            [(Path("test/test_files/audio_sample.wav"),), "cool audio"],
            [(Path("test/test_files/bus.png"), "A bus"), "cool pic"],
        ]
        postprocessed_multimodal_msg = chatbot.postprocess(multimodal_msg).model_dump()  # type: ignore
        for msg in postprocessed_multimodal_msg:
            assert "file" in msg[0]
            assert msg[1] in {"cool video", "cool audio", "cool pic"}
            assert msg[0]["file"]["path"].split(".")[-1] in {"mp4", "wav", "png"}
            if msg[0]["alt_text"]:
                assert msg[0]["alt_text"] == "A bus"

        assert chatbot.get_config() == {
            "value": [],
            "label": None,
            "show_label": True,
            "name": "chatbot",
            "show_share_button": False,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "editable": None,
            "container": True,
            "min_width": 160,
            "group_consecutive_messages": True,
            "scale": None,
            "placeholder": None,
            "height": 400,
            "feedback_options": ("Like", "Dislike"),
            "feedback_value": None,
            "resizable": False,
            "max_height": None,
            "min_height": None,
            "autoscroll": True,
            "proxy_url": None,
            "_selectable": False,
            "_retryable": False,
            "_undoable": False,
            "allow_file_downloads": True,
            "key": None,
            "preserved_by_key": ["value"],
            "type": "tuples",
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "likeable": False,
            "rtl": False,
            "show_copy_button": False,
            "avatar_images": [None, None],
            "sanitize_html": True,
            "render_markdown": True,
            "bubble_full_width": None,
            "line_breaks": True,
            "layout": None,
            "allow_tags": False,
            "show_copy_all_button": False,
            "examples": None,
            "watermark": None,
        }

    def test_avatar_images_are_moved_to_cache(self):
        chatbot = gr.Chatbot(avatar_images=("test/test_files/bus.png", None))
        assert chatbot.avatar_images[0]
        assert utils.is_in_or_equal(
            chatbot.avatar_images[0]["path"], chatbot.GRADIO_CACHE
        )
        assert chatbot.avatar_images[1] is None
