import asyncio
import inspect
import io
import random
import sys
import time
import unittest
import unittest.mock as mock
from contextlib import contextmanager
from unittest.mock import patch

import mlflow
import pytest
import wandb

import gradio as gr
from gradio.routes import PredictBody
from gradio.test_data.blocks_configs import XRAY_CONFIG
from gradio.utils import assert_configs_are_equivalent_besides_ids

pytest_plugins = ("pytest_asyncio",)


@contextmanager
def captured_output():
    new_out, new_err = io.StringIO(), io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = new_out, new_err
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout, sys.stderr = old_out, old_err


class TestBlocks(unittest.TestCase):
    maxDiff = None

    def test_set_share(self):
        with gr.Blocks() as demo:
            # self.share is False when instantiating the class
            self.assertFalse(demo.share)
            # default is False, if share is None
            demo.share = None
            self.assertFalse(demo.share)
            # if set to True, it doesn't change
            demo.share = True
            self.assertTrue(demo.share)

    @patch("gradio.utils.colab_check")
    def test_set_share_in_colab(self, mock_colab_check):
        mock_colab_check.return_value = True
        with gr.Blocks() as demo:
            # self.share is False when instantiating the class
            self.assertFalse(demo.share)
            # default is True, if share is None and colab_check is true
            demo.share = None
            self.assertTrue(demo.share)
            # if set to True, it doesn't change
            demo.share = True
            self.assertTrue(demo.share)

    def test_xray(self):
        def fake_func():
            return "Hello There"

        xray_model = lambda diseases, img: {
            disease: random.random() for disease in diseases
        }
        ct_model = lambda diseases, img: {disease: 0.1 for disease in diseases}

        with gr.Blocks() as demo:
            gr.Markdown(
                """
            # Detect Disease From Scan
            With this model you can lorem ipsum
            - ipsum 1
            - ipsum 2
            """
            )
            disease = gr.CheckboxGroup(
                choices=["Covid", "Malaria", "Lung Cancer"], label="Disease to Scan For"
            )

            with gr.Tabs():
                with gr.TabItem("X-ray"):
                    with gr.Row():
                        xray_scan = gr.Image()
                        xray_results = gr.JSON()
                    xray_run = gr.Button("Run")
                    xray_run.click(
                        xray_model, inputs=[disease, xray_scan], outputs=xray_results
                    )

                with gr.TabItem("CT Scan"):
                    with gr.Row():
                        ct_scan = gr.Image()
                        ct_results = gr.JSON()
                    ct_run = gr.Button("Run")
                    ct_run.click(
                        ct_model, inputs=[disease, ct_scan], outputs=ct_results
                    )
            textbox = gr.Textbox()
            demo.load(fake_func, [], [textbox])

        config = demo.get_config_file()
        self.assertTrue(assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, config))

    def test_load_from_config(self):
        def update(name):
            return f"Welcome to Gradio, {name}!"

        with gr.Blocks() as demo1:
            inp = gr.Textbox(placeholder="What is your name?")
            out = gr.Textbox()

            inp.submit(fn=update, inputs=inp, outputs=out, api_name="greet")

            gr.Image().style(height=54, width=240)

        config1 = demo1.get_config_file()
        demo2 = gr.Blocks.from_config(config1, [update])
        config2 = demo2.get_config_file()
        self.assertTrue(assert_configs_are_equivalent_besides_ids(config1, config2))

    @pytest.mark.asyncio
    async def test_async_function(self):
        async def wait():
            await asyncio.sleep(0.01)
            return True

        with gr.Blocks() as demo:
            text = gr.Textbox()
            button = gr.Button()
            button.click(wait, [text], [text])

            body = PredictBody(data=1, fn_index=0)
            start = time.time()
            result = await demo.process_api(body)
            end = time.time()
            difference = end - start
            assert difference >= 0.01
            assert result

    def test_integration_wandb(self):
        with captured_output() as (out, err):
            wandb.log = mock.MagicMock()
            wandb.Html = mock.MagicMock()
            demo = gr.Blocks()
            with demo:
                gr.Textbox("Hi there!")
            demo.integrate(wandb=wandb)

            self.assertEqual(
                out.getvalue().strip(),
                "The WandB integration requires you to `launch(share=True)` first.",
            )
            demo.share_url = "tmp"
            demo.integrate(wandb=wandb)
            wandb.log.assert_called_once()

    @mock.patch("comet_ml.Experiment")
    def test_integration_comet(self, mock_experiment):
        experiment = mock_experiment()
        experiment.log_text = mock.MagicMock()
        experiment.log_other = mock.MagicMock()

        demo = gr.Blocks()
        with demo:
            gr.Textbox("Hi there!")

        demo.launch(prevent_thread_lock=True)
        demo.integrate(comet_ml=experiment)
        experiment.log_text.assert_called_with("gradio: " + demo.local_url)
        demo.share_url = "tmp"  # used to avoid creating real share links.
        demo.integrate(comet_ml=experiment)
        experiment.log_text.assert_called_with("gradio: " + demo.share_url)
        self.assertEqual(experiment.log_other.call_count, 2)
        demo.share_url = None
        demo.close()

    def test_integration_mlflow(self):
        mlflow.log_param = mock.MagicMock()
        demo = gr.Blocks()
        with demo:
            gr.Textbox("Hi there!")

        demo.launch(prevent_thread_lock=True)
        demo.integrate(mlflow=mlflow)
        mlflow.log_param.assert_called_with(
            "Gradio Interface Local Link", demo.local_url
        )
        demo.share_url = "tmp"  # used to avoid creating real share links.
        demo.integrate(mlflow=mlflow)
        mlflow.log_param.assert_called_with(
            "Gradio Interface Share Link", demo.share_url
        )
        demo.share_url = None
        demo.close()


def test_slider_random_value_config():
    with gr.Blocks() as demo:
        gr.Slider(
            value=11.2, minimum=-10.2, maximum=15, label="Non-random Slider (Static)"
        )
        gr.Slider(
            randomize=True, minimum=100, maximum=200, label="Random Slider (Input 1)"
        )
        gr.Slider(
            randomize=True, minimum=10, maximum=23.2, label="Random Slider (Input 2)"
        )
    for component in demo.blocks.values():
        if isinstance(component, gr.components.IOComponent):
            if "Non-random" in component.label:
                assert not component.attach_load_event
            else:
                assert component.attach_load_event
    dependencies_on_load = [
        dep["trigger"] == "load" for dep in demo.config["dependencies"]
    ]
    assert all(dependencies_on_load)
    assert len(dependencies_on_load) == 2
    assert not any([dep["queue"] for dep in demo.config["dependencies"]])


def test_io_components_attach_load_events_when_value_is_fn():
    classes_to_check = gr.components.IOComponent.__subclasses__()
    subclasses = []

    while classes_to_check:
        subclass = classes_to_check.pop()
        children = subclass.__subclasses__()

        if children:
            classes_to_check.extend(children)
        if "value" in inspect.signature(subclass).parameters:
            subclasses.append(subclass)

    interface = gr.Interface(
        lambda *args: None,
        inputs=[comp(value=lambda: None) for comp in subclasses],
        outputs=None,
    )

    dependencies_on_load = [
        dep for dep in interface.config["dependencies"] if dep["trigger"] == "load"
    ]
    assert len(dependencies_on_load) == len(subclasses)


if __name__ == "__main__":
    unittest.main()
