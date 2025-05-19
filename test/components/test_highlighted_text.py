import gradio as gr


class TestHighlightedText:
    def test_postprocess(self):
        """
        postprocess
        """
        component = gr.HighlightedText()
        value = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
            ("", None),
        ]
        result = [
            {"token": "", "class_or_confidence": None},
            {"token": "Wolfgang", "class_or_confidence": "PER"},
            {"token": " lives in ", "class_or_confidence": None},
            {"token": "Berlin", "class_or_confidence": "LOC"},
            {"token": "", "class_or_confidence": None},
        ]
        assert (result_ := component.postprocess(value))
        result_ = result_.model_dump()
        assert result == result_

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result == result_

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity_group": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result == result_

        # Test split entity is merged when combine adjacent is set
        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 4},
            {"entity": "PER", "start": 4, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        # After a merge empty entries are stripped except the leading one
        result_after_merge = [
            {"token": "", "class_or_confidence": None},
            {"token": "Wolfgang", "class_or_confidence": "PER"},
            {"token": " lives in ", "class_or_confidence": None},
            {"token": "Berlin", "class_or_confidence": "LOC"},
        ]
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result != result_
        assert result_after_merge != result_

        component = gr.HighlightedText(combine_adjacent=True)
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result_after_merge == result_

        component = gr.HighlightedText()

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "LOC", "start": 18, "end": 24},
            {"entity": "PER", "start": 0, "end": 8},
        ]
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result == result_

        text = "I live there"
        entities = []
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result_ == [{"token": text, "class_or_confidence": None}]

        text = "Wolfgang"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
        ]
        assert (result_ := component.postprocess({"text": text, "entities": entities}))
        result_ = result_.model_dump()
        assert result_ == [
            {"token": "", "class_or_confidence": None},
            {"token": text, "class_or_confidence": "PER"},
            {"token": "", "class_or_confidence": None},
        ]

    def test_component_functions(self):
        """
        get_config
        """
        ht_output = gr.HighlightedText(color_map={"pos": "green", "neg": "red"})
        assert ht_output.get_config() == {
            "color_map": {"pos": "green", "neg": "red"},
            "name": "highlightedtext",
            "show_label": True,
            "label": None,
            "show_legend": False,
            "show_inline_category": True,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "proxy_url": None,
            "rtl": False,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "combine_adjacent": False,
            "adjacent_separator": "",
            "interactive": None,
        }

    def test_in_interface(self):
        """
        Interface, process
        """

        def highlight_vowels(sentence):
            phrases, cur_phrase = [], ""
            vowels, mode = "aeiou", None
            for letter in sentence:
                letter_mode = "vowel" if letter in vowels else "non"
                if mode is None:
                    mode = letter_mode
                elif mode != letter_mode:
                    phrases.append((cur_phrase, mode))
                    cur_phrase = ""
                    mode = letter_mode
                cur_phrase += letter
            phrases.append((cur_phrase, mode))
            return phrases

        iface = gr.Interface(highlight_vowels, "text", "highlight")
        output = iface("Helloooo")
        assert output == [
            {"token": "H", "class_or_confidence": "non"},
            {"token": "e", "class_or_confidence": "vowel"},
            {"token": "ll", "class_or_confidence": "non"},
            {"token": "oooo", "class_or_confidence": "vowel"},
        ]
