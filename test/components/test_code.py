from pathlib import Path

import gradio as gr


class TestCode:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        code = gr.Code()

        assert code.preprocess("# hello friends") == "# hello friends"
        assert code.preprocess("def fn(a):\n  return a") == "def fn(a):\n  return a"

        assert (
            code.postprocess(
                """
            def fn(a):
                return a
            """
            )
            == """def fn(a):
                return a"""
        )

        test_file_dir = Path(__file__).parent.parent / "test_files"
        path = str(test_file_dir / "test_label_json.json")
        assert code.postprocess(path) == path

        assert code.get_config() == {
            "value": None,
            "language": None,
            "lines": 5,
            "max_lines": None,
            "name": "code",
            "show_label": True,
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "wrap_lines": False,
            "key": None,
            "preserved_by_key": ["value"],
            "show_line_numbers": True,
            "autocomplete": False,
        }

    def test_process_example(self):
        code = gr.Code()
        assert (
            code.process_example("def fn(a):\n  return a") == "def fn(a):\n  return a"
        )
        assert code.process_example(None) is None
        filename = str(Path("test/test_files/test_label_json.json"))
        assert code.process_example(filename) == filename
