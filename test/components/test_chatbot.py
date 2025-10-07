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
            [
                {"role": "user", "content": "You are **cool**\nand fun"},
                {"role": "assistant", "content": "so are *you*"},
            ]
        ).model_dump() == [
            {
                "role": "user",
                "content": "You are **cool**\nand fun",
                "metadata": None,
                "options": None,
            },
            {
                "role": "assistant",
                "content": "so are *you*",
                "metadata": None,
                "options": None,
            },
        ]

        multimodal_msg = [
            {"role": "user", "content": ("test/test_files/video_sample.mp4",)},
            {"role": "assistant", "content": "cool video"},
            {"role": "user", "content": ("test/test_files/audio_sample.wav",)},
            {"role": "assistant", "content": "cool audio"},
            {"role": "user", "content": ("test/test_files/bus.png", "A bus")},
            {"role": "assistant", "content": "cool pic"},
            {"role": "user", "content": (Path("test/test_files/video_sample.mp4"),)},
            {"role": "assistant", "content": "cool video"},
            {"role": "user", "content": (Path("test/test_files/audio_sample.wav"),)},
            {"role": "assistant", "content": "cool audio"},
            {"role": "user", "content": (Path("test/test_files/bus.png"), "A bus")},
            {"role": "assistant", "content": "cool pic"},
        ]
        postprocessed_multimodal_msg = chatbot.postprocess(multimodal_msg).model_dump()  # type: ignore
        for msg in postprocessed_multimodal_msg:
            if msg["role"] == "user":
                assert "file" in msg["content"]
                assert msg["content"]["file"]["path"].split(".")[-1] in {
                    "mp4",
                    "wav",
                    "png",
                }
                if msg["content"]["alt_text"]:
                    assert msg["content"]["alt_text"] == "A bus"
            elif msg["role"] == "assistant":
                assert msg["content"] in {"cool video", "cool audio", "cool pic"}
            else:
                raise ValueError(f"Unexpected role: {msg['role']}")
        assert chatbot.get_config() == {
            "value": [],
            "label": None,
            "show_label": True,
            "name": "chatbot",
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
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "likeable": False,
            "rtl": False,
            "buttons": None,
            "avatar_images": [None, None],
            "sanitize_html": True,
            "render_markdown": True,
            "bubble_full_width": None,
            "line_breaks": True,
            "layout": None,
            "allow_tags": True,
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
