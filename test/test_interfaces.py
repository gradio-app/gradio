import io
import sys
import unittest
import unittest.mock as mock
from contextlib import contextmanager

import mlflow
import requests
import wandb

from gradio.interface import Interface, close_all, os

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


class TestInterface(unittest.TestCase):
    def test_close(self):
        io = Interface(lambda input: None, "textbox", "label")
        _, local_url, _ = io.launch(prevent_thread_lock=True)
        response = requests.get(local_url)
        self.assertEqual(response.status_code, 200)
        io.close()
        with self.assertRaises(Exception):
            response = requests.get(local_url)

    def test_close_all(self):
        interface = Interface(lambda input: None, "textbox", "label")
        interface.close = mock.MagicMock()
        close_all()
        interface.close.assert_called()

    def test_examples_invalid_input(self):
        with self.assertRaises(ValueError):
            Interface(lambda x: x, examples=1234)

    def test_examples_valid_path(self):
        path = os.path.join(os.path.dirname(__file__), "test_data/flagged_with_log")
        interface = Interface(lambda x: 3 * x, "number", "number", examples=path)
        self.assertEqual(len(interface.get_config_file()["examples"]), 2)

        path = os.path.join(os.path.dirname(__file__), "test_data/flagged_no_log")
        interface = Interface(lambda x: 3 * x, "number", "number", examples=path)
        self.assertEqual(len(interface.get_config_file()["examples"]), 3)

    def test_examples_not_valid_path(self):
        with self.assertRaises(FileNotFoundError):
            interface = Interface(
                lambda x: x, "textbox", "label", examples="invalid-path"
            )
            interface.launch(prevent_thread_lock=True)
            interface.close()

    def test_test_launch(self):
        with captured_output() as (out, err):
            prediction_fn = lambda x: x
            prediction_fn.__name__ = "prediction_fn"
            interface = Interface(prediction_fn, "textbox", "label")
            interface.test_launch()
            output = out.getvalue().strip()
            self.assertEqual(output, "Test launch: prediction_fn()... PASSED")

    @mock.patch("time.sleep")
    def test_block_thread(self, mock_sleep):
        with self.assertRaises(KeyboardInterrupt):
            with captured_output() as (out, _):
                mock_sleep.side_effect = KeyboardInterrupt()
                interface = Interface(lambda x: x, "textbox", "label")
                interface.launch(prevent_thread_lock=False)
                output = out.getvalue().strip()
                self.assertEqual(
                    output, "Keyboard interruption in main thread... closing server."
                )

    @mock.patch("gradio.utils.colab_check")
    def test_launch_colab_share(self, mock_colab_check):
        mock_colab_check.return_value = True
        interface = Interface(lambda x: x, "textbox", "label")
        _, _, share_url = interface.launch(prevent_thread_lock=True)
        self.assertIsNotNone(share_url)
        interface.close()

    @mock.patch("gradio.utils.colab_check")
    @mock.patch("gradio.networking.setup_tunnel")
    def test_launch_colab_share_error(self, mock_setup_tunnel, mock_colab_check):
        mock_setup_tunnel.side_effect = RuntimeError()
        mock_colab_check.return_value = True
        interface = Interface(lambda x: x, "textbox", "label")
        _, _, share_url = interface.launch(prevent_thread_lock=True)
        self.assertIsNone(share_url)
        interface.close()

    def test_interface_representation(self):
        prediction_fn = lambda x: x
        prediction_fn.__name__ = "prediction_fn"
        repr = str(Interface(prediction_fn, "textbox", "label")).split("\n")
        self.assertTrue(prediction_fn.__name__ in repr[0])
        self.assertEqual(len(repr[0]), len(repr[1]))

    def test_interface_load(self):
        io = Interface.load(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            alias="sentiment_classifier",
        )
        output = io("I am happy, I love you.")
        self.assertGreater(output["POSITIVE"], 0.5)

    def test_interface_none_interp(self):
        interface = Interface(lambda x: x, "textbox", "label", interpretation=[None])
        scores, alternative_outputs = interface.interpret(["quickest brown fox"])
        self.assertIsNone(scores[0])

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
        self.assertEqual(len(interface.examples), 2)
        self.assertEqual(len(interface.examples[0]), 1)
        interface.close()

    @mock.patch("IPython.display.display")
    def test_inline_display(self, mock_display):
        interface = Interface(lambda x: x, "textbox", "label")
        interface.launch(inline=True, prevent_thread_lock=True)
        mock_display.assert_called_once()
        interface.launch(inline=True, share=True, prevent_thread_lock=True)
        self.assertEqual(mock_display.call_count, 2)
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
        self.assertEqual(experiment.log_other.call_count, 2)
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
            interface.integrate(wandb=wandb)
            self.assertEqual(
                out.getvalue().strip(),
                "The WandB integration requires you to `launch(share=True)` first.",
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


if __name__ == "__main__":
    unittest.main()
