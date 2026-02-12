import gradio as gr
from gradio.components.dialogue import DialogueLine, DialogueModel


class TestDialogue:
    def test_component_functions(self):
        """
        Test preprocess, postprocess, and basic functionality
        """
        dialogue = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"])

        dialogue_data = [
            DialogueLine(speaker="Speaker 1", text="Hello there!"),
            DialogueLine(speaker="Speaker 2", text="Hi, how are you?"),
        ]

        preprocessed = dialogue.preprocess(gr.Dialogue.data_model(root=dialogue_data))
        assert preprocessed == "[Speaker 1] Hello there!\n[Speaker 2] Hi, how are you?"

        postprocessed = dialogue.postprocess(
            [
                {"speaker": "Speaker 1", "text": "Hello there!"},
                {"speaker": "Speaker 2", "text": "Hi, how are you?"},
            ]
        )
        assert postprocessed is not None
        assert isinstance(postprocessed.root, list)
        assert len(postprocessed.root) == 2
        assert postprocessed.root[0].speaker == "Speaker 1"
        assert postprocessed.root[0].text == "Hello there!"

        postprocessed_str = dialogue.postprocess("Hello world")
        assert postprocessed_str is not None
        assert isinstance(postprocessed_str.root, str)
        assert postprocessed_str.root == "Hello world"

        assert dialogue.postprocess(None) is None

    def test_dialogue_with_tags(self):
        """
        Test dialogue with tags parameter
        """
        dialogue = gr.Dialogue(
            speakers=["Agent", "Customer"],
            tags=["greeting", "question", "answer", "closing"],
        )

        assert dialogue.tags == ["greeting", "question", "answer", "closing"]
        assert dialogue.speakers == ["Agent", "Customer"]

    def test_dialogue_with_color_map(self):
        """
        Test dialogue with custom color map
        """
        color_map = {"Speaker 1": "#ff0000", "Speaker 2": "#00ff00"}
        dialogue = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"], color_map=color_map)

        assert dialogue.color_map == color_map

    def test_dialogue_with_formatter(self):
        """
        Test dialogue with custom formatter
        """

        def custom_formatter(speaker, text):
            return f"{speaker}: {text}"

        dialogue = gr.Dialogue(speakers=["Alice", "Bob"], formatter=custom_formatter)

        dialogue_data = [
            DialogueLine(speaker="Alice", text="Hello!"),
            DialogueLine(speaker="Bob", text="Hi there!"),
        ]

        preprocessed = dialogue.preprocess(gr.Dialogue.data_model(root=dialogue_data))
        assert preprocessed == "Alice: Hello!\nBob: Hi there!"

    def test_dialogue_without_speakers(self):
        """
        Test dialogue without speakers (plain text mode)
        """
        dialogue = gr.Dialogue(speakers=None)

        assert dialogue.speakers is None

        preprocessed = dialogue.preprocess(
            gr.Dialogue.data_model(root="Just some text")
        )
        assert preprocessed == "Just some text"

    def test_get_config(self):
        """
        Test get_config returns expected configuration
        """
        dialogue = gr.Dialogue(
            speakers=["A", "B"],
            label="Test Dialogue",
            buttons=["copy"],
            max_lines=10,
        )

        config = dialogue.get_config()
        assert config["speakers"] == ["A", "B"]
        assert config["label"] == "Test Dialogue"
        assert config["buttons"] == ["copy"]
        assert config["max_lines"] == 10
        assert config["name"] == "dialogue"

    def test_dialogue_separator(self):
        """
        Test dialogue with custom separator
        """
        dialogue = gr.Dialogue(speakers=["A", "B"], separator="\n")

        dialogue_data = [
            DialogueLine(speaker="A", text="First line"),
            DialogueLine(speaker="B", text="Second line"),
        ]

        preprocessed = dialogue.preprocess(gr.Dialogue.data_model(root=dialogue_data))
        assert preprocessed == "[A] First line\n[B] Second line"

    def test_example_value(self):
        """
        Test example_value and as_example methods
        """
        dialogue = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"])

        example = dialogue.example_value()
        assert isinstance(example, list)
        assert len(example) == 2
        assert example[0]["speaker"] == "Speaker 1"
        assert example[0]["text"] == "Hello, how are you?"

        example_str = dialogue.as_example(example)
        assert isinstance(example_str, str)
        assert "Speaker 1" in example_str
        assert "Hello, how are you?" in example_str

    def test_dialogue_preprocess_list(self):
        """
        Test preprocess with a list of DialogueLine objects
        """
        dialogue = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"], type="list")

        dialogue_data = DialogueModel(
            root=[
                DialogueLine(speaker="Speaker 1", text="Hello!"),
                DialogueLine(speaker="Speaker 2", text="Hi!"),
            ]
        )

        preprocessed = dialogue.preprocess(dialogue_data)
        assert preprocessed == [
            {"speaker": "Speaker 1", "text": "Hello!"},
            {"speaker": "Speaker 2", "text": "Hi!"},
        ]
