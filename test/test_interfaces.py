import io
import sys
import unittest.mock as mock
from contextlib import contextmanager
from functools import partial
from string import capwords

import mlflow
import pytest
import requests
import wandb
from fastapi.testclient import TestClient

import gradio
from gradio.blocks import Blocks
from gradio.interface import Interface, TabbedInterface, close_all, os
from gradio.layouts import TabItem, Tabs
from gradio.utils import assert_configs_are_equivalent_besides_ids

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


@contextmanager
def captured_output():
    new_out, new_err = io.StringIO(), io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = new_out, new_err
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout, sys.stderr = old_out, old_err


class TestInterface:
    def test_close(self):
        io = Interface(lambda input: None, "textbox", "label")
        _, local_url, _ = io.launch(prevent_thread_lock=True)
        response = requests.get(local_url)
        assert response.status_code == 200
        io.close()
        with pytest.raises(Exception):
            response = requests.get(local_url)

    def test_close_all(self):
        interface = Interface(lambda input: None, "textbox", "label")
        interface.close = mock.MagicMock()
        close_all()
        interface.close.assert_called()

    def test_no_input_or_output(self):
        with pytest.raises(TypeError):
            Interface(lambda x: x, examples=1234)

    def test_partial_functions(self):
        def greet(name, formatter):
            return formatter("Hello " + name + "!")

        greet_upper_case = partial(greet, formatter=capwords)
        demo = Interface(fn=greet_upper_case, inputs="text", outputs="text")
        assert demo("abubakar") == "Hello Abubakar!"

    def test_examples_valid_path(self):
        path = os.path.join(
            os.path.dirname(__file__), "../gradio/test_data/flagged_with_log"
        )
        interface = Interface(lambda x: 3 * x, "number", "number", examples=path)
        dataset_check = any(
            [c["type"] == "dataset" for c in interface.get_config_file()["components"]]
        )
        assert dataset_check

    def test_test_launch(self):
        with captured_output() as (out, err):
            prediction_fn = lambda x: x
            prediction_fn.__name__ = "prediction_fn"
            interface = Interface(prediction_fn, "textbox", "label")
            interface.test_launch()
            output = out.getvalue().strip()
            assert output == "Test launch: prediction_fn()... PASSED"

    @mock.patch("time.sleep")
    def test_block_thread(self, mock_sleep):
        with pytest.raises(KeyboardInterrupt):
            with captured_output() as (out, _):
                mock_sleep.side_effect = KeyboardInterrupt()
                interface = Interface(lambda x: x, "textbox", "label")
                interface.launch(prevent_thread_lock=False)
                output = out.getvalue().strip()
                assert (
                    output == "Keyboard interruption in main thread... closing server."
                )

    @mock.patch("gradio.utils.colab_check")
    def test_launch_colab_share(self, mock_colab_check):
        mock_colab_check.return_value = True
        interface = Interface(lambda x: x, "textbox", "label")
        _, _, share_url = interface.launch(prevent_thread_lock=True)
        assert share_url is None
        interface.close()

    @mock.patch("gradio.utils.colab_check")
    @mock.patch("gradio.networking.setup_tunnel")
    def test_launch_colab_share_error(self, mock_setup_tunnel, mock_colab_check):
        mock_setup_tunnel.side_effect = RuntimeError()
        mock_colab_check.return_value = True
        interface = Interface(lambda x: x, "textbox", "label")
        _, _, share_url = interface.launch(prevent_thread_lock=True)
        assert share_url is None
        interface.close()

    def test_interface_representation(self):
        prediction_fn = lambda x: x
        prediction_fn.__name__ = "prediction_fn"
        repr = str(Interface(prediction_fn, "textbox", "label")).split("\n")
        assert prediction_fn.__name__ in repr[0]
        assert len(repr[0]) == len(repr[1])

    @pytest.mark.asyncio
    async def test_interface_none_interp(self):
        interface = Interface(lambda x: x, "textbox", "label", interpretation=[None])
        scores = (await interface.interpret(["quickest brown fox"]))[0][
            "interpretation"
        ]
        assert scores is None

    @mock.patch("webbrowser.open")
    def test_interface_browser(self, mock_browser):
        interface = Interface(lambda x: x, "textbox", "label")
        interface.launch(inbrowser=True, prevent_thread_lock=True)
        mock_browser.assert_called_once()
        interface.close()

    def test_examples_list(self):
        examples = ["test1", "test2"]
        interface = Interface(lambda x: x, "textbox", "label", examples=examples)
        interface.launch(prevent_thread_lock=True)
        assert len(interface.examples_handler.examples) == 2
        assert len(interface.examples_handler.examples[0]) == 1
        interface.close()

    @mock.patch("IPython.display.display")
    def test_inline_display(self, mock_display):
        interface = Interface(lambda x: x, "textbox", "label")
        interface.launch(inline=True, prevent_thread_lock=True)
        mock_display.assert_called_once()
        interface.launch(inline=True, prevent_thread_lock=True)
        assert mock_display.call_count == 2
        interface.close()

    @mock.patch("comet_ml.Experiment")
    def test_integration_comet(self, mock_experiment):
        experiment = mock_experiment()
        experiment.log_text = mock.MagicMock()
        experiment.log_other = mock.MagicMock()
        interface = Interface(lambda x: x, "textbox", "label")
        interface.launch(prevent_thread_lock=True)
        interface.integrate(comet_ml=experiment)
        experiment.log_text.assert_called_with("gradio: " + interface.local_url)
        interface.share_url = "tmp"  # used to avoid creating real share links.
        interface.integrate(comet_ml=experiment)
        experiment.log_text.assert_called_with("gradio: " + interface.share_url)
        assert experiment.log_other.call_count == 2
        interface.share_url = None
        interface.close()

    def test_integration_mlflow(self):
        mlflow.log_param = mock.MagicMock()
        interface = Interface(lambda x: x, "textbox", "label")
        interface.launch(prevent_thread_lock=True)
        interface.integrate(mlflow=mlflow)
        mlflow.log_param.assert_called_with(
            "Gradio Interface Local Link", interface.local_url
        )
        interface.share_url = "tmp"  # used to avoid creating real share links.
        interface.integrate(mlflow=mlflow)
        mlflow.log_param.assert_called_with(
            "Gradio Interface Share Link", interface.share_url
        )
        interface.share_url = None
        interface.close()

    def test_integration_wandb(self):
        with captured_output() as (out, err):
            wandb.log = mock.MagicMock()
            wandb.Html = mock.MagicMock()
            interface = Interface(lambda x: x, "textbox", "label")
            interface.width = 500
            interface.height = 500
            interface.integrate(wandb=wandb)

            assert (
                out.getvalue().strip()
                == "The WandB integration requires you to `launch(share=True)` first."
            )
            interface.share_url = "tmp"
            interface.integrate(wandb=wandb)
            wandb.log.assert_called_once()

    @mock.patch("requests.post")
    def test_integration_analytics(self, mock_post):
        mlflow.log_param = mock.MagicMock()
        interface = Interface(lambda x: x, "textbox", "label")
        interface.analytics_enabled = True
        interface.integrate(mlflow=mlflow)
        mock_post.assert_called_once()


class TestTabbedInterface:
    def test_tabbed_interface_config_matches_manual_tab(self):
        interface1 = Interface(lambda x: x, "textbox", "textbox")
        interface2 = Interface(lambda x: x, "image", "image")

        with Blocks(mode="tabbed_interface") as demo:
            with Tabs():
                with TabItem(label="tab1"):
                    interface1.render()
                with TabItem(label="tab2"):
                    interface2.render()

        interface3 = Interface(lambda x: x, "textbox", "textbox")
        interface4 = Interface(lambda x: x, "image", "image")
        tabbed_interface = TabbedInterface([interface3, interface4], ["tab1", "tab2"])

        assert assert_configs_are_equivalent_besides_ids(
            demo.get_config_file(), tabbed_interface.get_config_file()
        )


class TestDeprecatedInterface:
    def test_deprecation_notice(self):
        with pytest.warns(Warning):
            _ = Interface(lambda x: x, "textbox", "textbox", verbose=True)


class TestInterfaceInterpretation:
    def test_interpretation_from_interface(self):
        def quadratic(num1: float, num2: float) -> float:
            return 3 * num1**2 + num2

        iface = Interface(
            fn=quadratic,
            inputs=["number", "number"],
            outputs="number",
            interpretation="default",
        )

        app, _, _ = iface.launch(prevent_thread_lock=True)
        client = TestClient(app)

        btn = next(
            c["id"]
            for c in iface.config["components"]
            if c["props"].get("value") == "Interpret"
        )
        fn_index = next(
            i
            for i, d in enumerate(iface.config["dependencies"])
            if d["targets"] == [btn]
        )

        response = client.post(
            "/api/predict/", json={"fn_index": fn_index, "data": [10, 50, 350]}
        )
        assert response.json()["data"][0]["interpretation"] is not None
        iface.close()
        close_all()


@pytest.mark.parametrize(
    "interface_type", ["standard", "input_only", "output_only", "unified"]
)
@pytest.mark.parametrize("live", [True, False])
@pytest.mark.parametrize("use_generator", [True, False])
def test_interface_adds_stop_button(interface_type, live, use_generator):
    def gen_func(inp):
        yield inp

    def func(inp):
        return inp

    if interface_type == "standard":
        interface = gradio.Interface(
            gen_func if use_generator else func, "number", "number", live=live
        )
    elif interface_type == "input_only":
        interface = gradio.Interface(
            gen_func if use_generator else func, "number", None, live=live
        )
    elif interface_type == "output_only":
        interface = gradio.Interface(
            gen_func if use_generator else func, None, "number", live=live
        )
    else:
        num = gradio.Number()
        interface = gradio.Interface(
            gen_func if use_generator else func, num, num, live=live
        )
    has_stop = (
        len(
            [
                c
                for c in interface.config["components"]
                if c["props"].get("variant", "") == "stop"
            ]
        )
        == 1
    )
    if use_generator and not live:
        assert has_stop
    else:
        assert not has_stop
