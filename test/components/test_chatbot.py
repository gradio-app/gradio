import gradio as gr
from gradio import utils


class TestChatbot:
    def test_component_functions(self):
        """
        Postprocess, get_config
        """
        chatbot = gr.Chatbot()
        assert chatbot.postprocess(  # type: ignore
            [  # type: ignore
                {"role": "user", "content": "You are **cool**\nand fun"},
                {"role": "assistant", "content": "so are *you*"},
            ]
        ).model_dump() == [
            {
                "role": "user",
                "content": [{"type": "text", "text": "You are **cool**\nand fun"}],
                "metadata": None,
                "options": None,
            },
            {
                "role": "assistant",
                "content": [{"type": "text", "text": "so are *you*"}],
                "metadata": None,
                "options": None,
            },
        ]

        multimodal_msg = [
            {"role": "user", "content": {"path": "test/test_files/video_sample.mp4"}},
            {"role": "assistant", "content": "cool video"},
            {"role": "user", "content": {"path": "test/test_files/audio_sample.wav"}},
            {"role": "assistant", "content": "cool audio"},
            {
                "role": "user",
                "content": {"path": "test/test_files/bus.png", "alt_text": "A bus"},
            },
            {"role": "assistant", "content": "cool pic"},
            {"role": "user", "content": {"path": "test/test_files/video_sample.mp4"}},
            {"role": "assistant", "content": "cool video"},
            {"role": "user", "content": {"path": "test/test_files/audio_sample.wav"}},
            {"role": "assistant", "content": "cool audio"},
            {
                "role": "user",
                "content": {
                    "file": {"path": "test/test_files/bus.png", "alt_text": "A bus"}
                },
            },
            {"role": "assistant", "content": "cool pic"},
        ]
        postprocessed_multimodal_msg = chatbot.postprocess(multimodal_msg).model_dump()  # type: ignore
        for msg in postprocessed_multimodal_msg:
            if msg["role"] == "user":
                assert "file" in msg["content"][0]
                assert msg["content"][0]["file"]["path"].split(".")[-1] in {
                    "mp4",
                    "wav",
                    "png",
                }
                if msg["content"][0]["alt_text"]:
                    assert msg["content"][0]["alt_text"] == "A bus"
            elif msg["role"] == "assistant":
                assert msg["content"][0]["text"] in {
                    "cool video",
                    "cool audio",
                    "cool pic",
                }
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
            "feedback_options": ["Like", "Dislike"],
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
            "buttons": ["share", "copy", "copy_all"],
            "avatar_images": [None, None],
            "sanitize_html": True,
            "render_markdown": True,
            "line_breaks": True,
            "layout": None,
            "allow_tags": True,
            "examples": None,
            "watermark": None,
            "reasoning_tags": None,
            "like_user_message": False,
        }

    def test_avatar_images_are_moved_to_cache(self):
        chatbot = gr.Chatbot(avatar_images=("test/test_files/bus.png", None))
        assert chatbot.avatar_images[0]
        assert utils.is_in_or_equal(
            chatbot.avatar_images[0]["path"], chatbot.GRADIO_CACHE
        )
        assert chatbot.avatar_images[1] is None

    def test_reasoning_tags_single_block(self):
        """Test reasoning_tags with a single thinking block"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>Let me think about this.</thinking>\nHere is my response.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 2
        assert result[0]["content"][0]["text"] == "Let me think about this."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[1]["content"][0]["text"] == "Here is my response."
        assert result[1]["metadata"] is None

    def test_reasoning_tags_multiple_blocks(self):
        """Test reasoning_tags with multiple thinking blocks"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>First thought.</thinking>\nFirst response.\n<thinking>Second thought.</thinking>\nSecond response.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 4
        assert result[0]["content"][0]["text"] == "First thought."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[1]["content"][0]["text"] == "First response."
        assert result[1]["metadata"] is None
        assert result[2]["content"][0]["text"] == "Second thought."
        assert result[2]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[3]["content"][0]["text"] == "Second response."
        assert result[3]["metadata"] is None

    def test_reasoning_tags_only_thinking(self):
        """Test reasoning_tags with only thinking content, no prose"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>Only thinking here.</thinking>",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 1
        assert result[0]["content"][0]["text"] == "Only thinking here."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}

    def test_reasoning_tags_multiple_tag_types(self):
        """Test reasoning_tags with multiple tag types like <reasoning>"""
        chatbot = gr.Chatbot(
            reasoning_tags=[
                ("<thinking>", "</thinking>"),
                ("<reasoning>", "</reasoning>"),
            ]
        )
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>Thinking block.</thinking>\nFirst response.\n<reasoning>Reasoning block.</reasoning>\nSecond response.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 4
        assert result[0]["content"][0]["text"] == "Thinking block."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[1]["content"][0]["text"] == "First response."
        assert result[1]["metadata"] is None
        assert result[2]["content"][0]["text"] == "Reasoning block."
        assert result[2]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[3]["content"][0]["text"] == "Second response."
        assert result[3]["metadata"] is None

    def test_reasoning_tags_no_thinking_tags(self):
        """Test reasoning_tags when no thinking tags are present"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Just a regular response with no thinking.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 1
        assert (
            result[0]["content"][0]["text"]
            == "Just a regular response with no thinking."
        )
        assert result[0]["metadata"] is None

    def test_reasoning_tags_disabled(self):
        """Test that reasoning_tags=None doesn't extract anything"""
        chatbot = gr.Chatbot(reasoning_tags=None)
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>This should not be extracted.</thinking>\nRegular response.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 1
        assert (
            result[0]["content"][0]["text"]
            == "<thinking>This should not be extracted.</thinking>\nRegular response."
        )
        assert result[0]["metadata"] is None

    def test_reasoning_tags_preserves_order(self):
        """Test that reasoning_tags preserves the order of thinking and prose"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Intro.\n<thinking>Think 1.</thinking>\nMiddle 1.\n<thinking>Think 2.</thinking>\nMiddle 2.\n<thinking>Think 3.</thinking>\nConclusion.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 7
        assert result[0]["content"][0]["text"] == "Intro."
        assert result[0]["metadata"] is None
        assert result[1]["content"][0]["text"] == "Think 1."
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "Middle 1."
        assert result[2]["metadata"] is None
        assert result[3]["content"][0]["text"] == "Think 2."
        assert result[3]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[4]["content"][0]["text"] == "Middle 2."
        assert result[4]["metadata"] is None
        assert result[5]["content"][0]["text"] == "Think 3."
        assert result[5]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[6]["content"][0]["text"] == "Conclusion."
        assert result[6]["metadata"] is None

    def test_reasoning_tags_consecutive_thinking_blocks(self):
        """Test consecutive thinking blocks with no prose between them"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>Think 1.</thinking><thinking>Think 2.</thinking>Prose.<thinking>Think 3.</thinking><thinking>Think 4.</thinking>",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 5
        assert result[0]["content"][0]["text"] == "Think 1."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[1]["content"][0]["text"] == "Think 2."
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "Prose."
        assert result[2]["metadata"] is None
        assert result[3]["content"][0]["text"] == "Think 3."
        assert result[3]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[4]["content"][0]["text"] == "Think 4."
        assert result[4]["metadata"] == {"title": "Reasoning", "status": "done"}

    def test_reasoning_tags_consecutive_prose_sections(self):
        """Test that consecutive prose sections get merged into one message"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Prose 1. Prose 2.<thinking>Think 1.</thinking>Prose 3. Prose 4.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 3
        assert result[0]["content"][0]["text"] == "Prose 1. Prose 2."
        assert result[0]["metadata"] is None
        assert result[1]["content"][0]["text"] == "Think 1."
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "Prose 3. Prose 4."
        assert result[2]["metadata"] is None

    def test_reasoning_tags_prose_before_thinking(self):
        """Test prose at the start followed by thinking blocks"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Starting with prose.<thinking>Then thinking.</thinking>Then more prose.",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 3
        assert result[0]["content"][0]["text"] == "Starting with prose."
        assert result[0]["metadata"] is None
        assert result[1]["content"][0]["text"] == "Then thinking."
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "Then more prose."
        assert result[2]["metadata"] is None

    def test_reasoning_tags_sets_pending_correctly(self):
        """Test prose at the start followed by thinking blocks"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Starting with prose.<thinking>Then thinking",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 2
        assert result[0]["content"][0]["text"] == "Starting with prose."
        assert result[0]["metadata"] is None
        assert result[1]["content"][0]["text"] == "Then thinking"
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "pending"}

    def test_reasoning_tags_sets_pending_correctly_multiple_thinking(self):
        """Test prose at the start followed by thinking blocks"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "Starting with prose.<thinking>Then thinking</thinking><thinking>More thinking",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 3
        assert result[0]["content"][0]["text"] == "Starting with prose."
        assert result[0]["metadata"] is None
        assert result[1]["content"][0]["text"] == "Then thinking"
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "More thinking"
        assert result[2]["metadata"] == {"title": "Reasoning", "status": "pending"}

    def test_reasoning_tags_multiple_thinking_only(self):
        """Test multiple consecutive thinking blocks with no prose at all"""
        chatbot = gr.Chatbot(reasoning_tags=[("<thinking>", "</thinking>")])
        messages = [
            {
                "role": "assistant",
                "content": "<thinking>Think 1.</thinking><thinking>Think 2.</thinking><thinking>Think 3.</thinking>",
            }
        ]
        result = chatbot.postprocess(messages).model_dump()  # type: ignore

        assert len(result) == 3
        assert result[0]["content"][0]["text"] == "Think 1."
        assert result[0]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[1]["content"][0]["text"] == "Think 2."
        assert result[1]["metadata"] == {"title": "Reasoning", "status": "done"}
        assert result[2]["content"][0]["text"] == "Think 3."
        assert result[2]["metadata"] == {"title": "Reasoning", "status": "done"}
