from __future__ import annotations

from typing import TYPE_CHECKING
import gradio as gr
from gradio import Blocks
from gradio import processing_utils
import tempfile

if TYPE_CHECKING:
    import datasets


class DatasetViewer(Blocks):

    def image_formatter(self, im):
        file_obj = tempfile.NamedTemporaryFile(
            delete=False,
            dir=self.temp_dir,
            suffix=".png",
        )
        im.save(file_obj.name)
        return file_obj.name

    def audio_formatter(self, audio):
        file_obj = tempfile.NamedTemporaryFile(
            delete=False,
            dir=self.temp_dir,
            suffix=".wav",
        )
        processing_utils.audio_to_file(audio['sampling_rate'], audio["array"], filename=file_obj.name)
        return file_obj.name

    def feature_to_value(self, value, feature):
        import datasets
        if isinstance(feature, datasets.Image):
            return self.image_formatter(value)
        if isinstance(feature, (datasets.Audio, datasets.Image)):
            return self.audio_formatter(value)
        return value

    @staticmethod
    def feature_to_gr_component(feature):
        import datasets
        if isinstance(feature, datasets.Audio):
            return gr.Audio()
        elif isinstance(feature, datasets.Image):
            return gr.Image()
        elif isinstance(feature, datasets.Value):
            if "int" in feature.dtype or "float" in feature.dtype or "decimal" in feature.dtype:
                return gr.Number()
            else:
                return gr.Textbox()
        elif isinstance(feature, datasets.ClassLabel):
            return gr.Textbox()
        else:
            return gr.Textbox()

    def __init__(self,
                 dataset: str | datasets.Dataset,
                 split: str | None = "train",
                 rows_per_page: int | None = 5):

        try:
            import datasets
        except ImportError:
            raise ValueError("datasets library must be installed to use DatasetViewer. "
                             "Please run python -m pip install datasets")

        if isinstance(dataset, str):
            dataset = datasets.load_dataset(dataset, split=split)

        components = []
        feature_names = []
        for name, feature in dataset.features.items():
            components.append(self.feature_to_gr_component(feature))
            feature_names.append(name)

        components = [self.feature_to_gr_component(feature) for feature in dataset.features.values()]
        self.dataset = dataset
        self.rows_per_page = rows_per_page
        self.feature_names = feature_names
        self.temp_dir = tempfile.mkdtemp()
        super().__init__()

        with self as demo:
            with gr.Row():
                with gr.Column():
                    state = gr.State(value={"current": 0})
                    view = gr.Dataset(components=components, headers=self.feature_names)
            with gr.Row():
                next_ = gr.Button(value="Next")
            demo.load(self.get_next, inputs=[state], outputs=[view, state])
            next_.click(self.get_next, inputs=[state], outputs=[view, state])
        self.temp_dirs.add(self.temp_dir)

    def get_next(self, state):
        current_index = state['current']
        batch = self.dataset[current_index:(current_index + self.rows_per_page)] #self.dataset.features.encode_batch(self.dataset[current_index:(current_index + self.rows_per_page)])
        new_samples = {}
        for feature_name, feature in batch.items():
            new_samples[feature_name] = [self.feature_to_value(feat, self.dataset.features[feature_name]) for feat in feature]
        new_samples = [new_samples[f] for f in self.feature_names]
        return gr.Dataset.update(samples=list(zip(*new_samples))), {"current": current_index + self.rows_per_page}




