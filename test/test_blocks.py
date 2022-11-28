import asyncio
import copy
import io
import json
import os
import random
import sys
import time
import unittest.mock as mock
from contextlib import contextmanager
from functools import partial
from string import capwords
from unittest.mock import patch

import mlflow
import pytest
import wandb
import websockets
from fastapi.testclient import TestClient

import gradio as gr
from gradio.exceptions import DuplicateBlockError
from gradio.test_data.blocks_configs import XRAY_CONFIG
from gradio.utils import assert_configs_are_equivalent_besides_ids

pytest_plugins = ("pytest_asyncio",)

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


class TestBlocksMethods:
    maxDiff = None

    def test_set_share(self):
        with gr.Blocks() as demo:
            # self.share is False when instantiating the class
            assert not demo.share
            # default is False, if share is None
            demo.share = None
            assert not demo.share
            # if set to True, it doesn't change
            demo.share = True
            assert demo.share

    @patch("gradio.networking.setup_tunnel")
    @patch("gradio.utils.colab_check")
    def test_set_share_in_colab(self, mock_colab_check, mock_setup_tunnel):
        mock_colab_check.return_value = True
        mock_setup_tunnel.return_value = "http://localhost:7860/"
        with gr.Blocks() as demo:
            # self.share is False when instantiating the class
            assert not demo.share
            # share default is False, if share is None in colab and no queueing
            demo.launch(prevent_thread_lock=True)
            assert not demo.share
            demo.close()
            # share becomes true, if share is None in colab with queueing
            demo.queue()
            demo.launch(prevent_thread_lock=True)
            assert demo.share
            demo.close()

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
        assert assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, config)
        assert config["show_api"] is True
        _ = demo.launch(prevent_thread_lock=True, show_api=False)
        assert demo.config["show_api"] is False

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
        assert assert_configs_are_equivalent_besides_ids(config1, config2)

    def test_partial_fn_in_config(self):
        def greet(name, formatter):
            return formatter("Hello " + name + "!")

        greet_upper_case = partial(greet, formatter=capwords)
        with gr.Blocks() as demo:
            t = gr.Textbox()
            o = gr.Textbox()
            t.change(greet_upper_case, t, o)

        assert len(demo.fns) == 1
        assert "fn" in str(demo.fns[0])

    @pytest.mark.asyncio
    async def test_dict_inputs_in_config(self):
        with gr.Blocks() as demo:
            first = gr.Textbox()
            last = gr.Textbox()
            btn = gr.Button()
            greeting = gr.Textbox()

            def greet(data):
                return f"Hello {data[first]} {data[last]}"

            btn.click(greet, {first, last}, greeting)

        result = await demo.process_api(inputs=["huggy", "face"], fn_index=0)
        assert result["data"] == ["Hello huggy face"]

    @pytest.mark.asyncio
    async def test_async_function(self):
        async def wait(x):
            await asyncio.sleep(0.01)
            return x

        with gr.Blocks() as demo:
            text = gr.Textbox()
            button = gr.Button()
            button.click(wait, [text], [text])

            start = time.time()
            result = await demo.process_api(inputs=[1], fn_index=0)
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

            assert (
                out.getvalue().strip()
                == "The WandB integration requires you to `launch(share=True)` first."
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
        assert experiment.log_other.call_count == 2
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

    @mock.patch("requests.post")
    def test_initiated_analytics(self, mock_post):
        with gr.Blocks(analytics_enabled=True):
            pass
        mock_post.assert_called_once()

    def test_show_error(self):
        with gr.Blocks() as demo:
            pass

        assert demo.show_error
        demo.launch(prevent_thread_lock=True)
        assert not demo.show_error
        demo.close()
        demo.launch(show_error=True, prevent_thread_lock=True)
        assert demo.show_error
        demo.close()


class TestComponentsInBlocks:
    def test_slider_random_value_config(self):
        with gr.Blocks() as demo:
            gr.Slider(
                value=11.2,
                minimum=-10.2,
                maximum=15,
                label="Non-random Slider (Static)",
            )
            gr.Slider(
                randomize=True,
                minimum=100,
                maximum=200,
                label="Random Slider (Input 1)",
            )
            gr.Slider(
                randomize=True,
                minimum=10,
                maximum=23.2,
                label="Random Slider (Input 2)",
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

    def test_io_components_attach_load_events_when_value_is_fn(self, io_components):
        io_components = [comp for comp in io_components if not (comp == gr.State)]
        interface = gr.Interface(
            lambda *args: None,
            inputs=[comp(value=lambda: None) for comp in io_components],
            outputs=None,
        )

        dependencies_on_load = [
            dep for dep in interface.config["dependencies"] if dep["trigger"] == "load"
        ]
        assert len(dependencies_on_load) == len(io_components)

    def test_blocks_do_not_filter_none_values_from_updates(self, io_components):
        io_components = [c() for c in io_components if c not in [gr.State, gr.Button]]
        with gr.Blocks() as demo:
            for component in io_components:
                component.render()
            btn = gr.Button(value="Reset")
            btn.click(
                lambda: [gr.update(value=None) for _ in io_components],
                inputs=[],
                outputs=io_components,
            )

        output = demo.postprocess_data(
            0, [gr.update(value=None) for _ in io_components], state=None
        )
        assert all(
            [o["value"] == c.postprocess(None) for o, c in zip(output, io_components)]
        )

    def test_blocks_does_not_replace_keyword_literal(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            btn = gr.Button(value="Reset")
            btn.click(
                lambda: gr.update(value="NO_VALUE"),
                inputs=[],
                outputs=text,
            )

        output = demo.postprocess_data(0, gr.update(value="NO_VALUE"), state=None)
        assert output[0]["value"] == "NO_VALUE"

    def test_blocks_returns_correct_output_dict_single_key(self):
        with gr.Blocks() as demo:
            num = gr.Number()
            num2 = gr.Number()
            update = gr.Button(value="update")

            def update_values(val):
                return {num2: gr.Number.update(value=42)}

            update.click(update_values, inputs=[num], outputs=[num2])

        output = demo.postprocess_data(
            0, {num2: gr.Number.update(value=42)}, state=None
        )
        assert output[0]["value"] == 42

        output = demo.postprocess_data(0, {num2: 23}, state=None)
        assert output[0] == 23

    @pytest.mark.asyncio
    async def test_blocks_update_dict_without_postprocessing(self):
        def infer(x):
            return gr.media_data.BASE64_IMAGE, gr.update(visible=True)

        with gr.Blocks() as demo:
            prompt = gr.Textbox()
            image = gr.Image()
            run_button = gr.Button()
            share_button = gr.Button("share", visible=False)
            run_button.click(infer, prompt, [image, share_button], postprocess=False)

        output = await demo.process_api(0, ["test"])
        assert output["data"][0] == gr.media_data.BASE64_IMAGE
        assert output["data"][1] == {"__type__": "update", "visible": True}

    @pytest.mark.asyncio
    async def test_blocks_update_dict_does_not_postprocess_value_if_postprocessing_false(
        self,
    ):
        def infer(x):
            return gr.Image.update(value=gr.media_data.BASE64_IMAGE)

        with gr.Blocks() as demo:
            prompt = gr.Textbox()
            image = gr.Image()
            run_button = gr.Button()
            run_button.click(infer, [prompt], [image], postprocess=False)

        output = await demo.process_api(0, ["test"])
        assert output["data"][0] == {
            "__type__": "update",
            "value": gr.media_data.BASE64_IMAGE,
        }

    @pytest.mark.asyncio
    async def test_blocks_update_interactive(
        self,
    ):
        def specific_update():
            return [
                gr.Image.update(interactive=True),
                gr.Textbox.update(interactive=True),
            ]

        def generic_update():
            return [gr.update(interactive=True), gr.update(interactive=True)]

        with gr.Blocks() as demo:
            run = gr.Button(value="Make interactive")
            image = gr.Image()
            textbox = gr.Text()
            run.click(specific_update, None, [image, textbox])
            run.click(generic_update, None, [image, textbox])

        for fn_index in range(2):
            output = await demo.process_api(fn_index, [])
            assert output["data"][0] == {
                "interactive": True,
                "__type__": "update",
                "mode": "dynamic",
            }
            assert output["data"][1] == {"__type__": "update", "mode": "dynamic"}


class TestCallFunction:
    @pytest.mark.asyncio
    async def test_call_regular_function(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            btn = gr.Button()
            btn.click(
                lambda x: "Hello, " + x,
                inputs=text,
                outputs=text,
            )

        output = await demo.call_function(0, ["World"])
        assert output["prediction"] == "Hello, World"
        output = demo("World")
        assert output == "Hello, World"

        output = await demo.call_function(0, ["Abubakar"])
        assert output["prediction"] == "Hello, Abubakar"

    @pytest.mark.asyncio
    async def test_call_multiple_functions(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            text2 = gr.Textbox()
            btn = gr.Button()
            btn.click(
                lambda x: "Hello, " + x,
                inputs=text,
                outputs=text,
            )
            text.change(
                lambda x: "Hi, " + x,
                inputs=text,
                outputs=text2,
            )

        output = await demo.call_function(0, ["World"])
        assert output["prediction"] == "Hello, World"
        output = demo("World")
        assert output == "Hello, World"

        output = await demo.call_function(1, ["World"])
        assert output["prediction"] == "Hi, World"
        output = demo("World", fn_index=1)  # fn_index must be a keyword argument
        assert output == "Hi, World"

    @pytest.mark.asyncio
    async def test_call_generator(self):
        def generator(x):
            for i in range(x):
                yield i

        with gr.Blocks() as demo:
            inp = gr.Number()
            out = gr.Number()
            btn = gr.Button()
            btn.click(
                generator,
                inputs=inp,
                outputs=out,
            )

        demo.queue()
        assert demo.config["enable_queue"]

        output = await demo.call_function(0, [3])
        assert output["prediction"] == 0
        output = await demo.call_function(0, [3], iterator=output["iterator"])
        assert output["prediction"] == 1
        output = await demo.call_function(0, [3], iterator=output["iterator"])
        assert output["prediction"] == 2
        output = await demo.call_function(0, [3], iterator=output["iterator"])
        assert output["prediction"] == gr.components._Keywords.FINISHED_ITERATING
        assert output["iterator"] is None
        output = await demo.call_function(0, [3], iterator=output["iterator"])
        assert output["prediction"] == 0

    @pytest.mark.asyncio
    async def test_call_both_generator_and_function(self):
        def generator(x):
            for i in range(x):
                yield i, x

        with gr.Blocks() as demo:
            inp = gr.Number()
            out1 = gr.Number()
            out2 = gr.Number()
            btn = gr.Button()
            inp.change(lambda x: x + x, inp, out1)
            btn.click(
                generator,
                inputs=inp,
                outputs=[out1, out2],
            )

        demo.queue()

        output = await demo.call_function(0, [2])
        assert output["prediction"] == 4
        output = await demo.call_function(0, [-1])
        assert output["prediction"] == -2

        output = await demo.call_function(1, [3])
        assert output["prediction"] == (0, 3)
        output = await demo.call_function(1, [3], iterator=output["iterator"])
        assert output["prediction"] == (1, 3)
        output = await demo.call_function(1, [3], iterator=output["iterator"])
        assert output["prediction"] == (2, 3)
        output = await demo.call_function(1, [3], iterator=output["iterator"])
        assert output["prediction"] == (gr.components._Keywords.FINISHED_ITERATING,) * 2
        assert output["iterator"] is None
        output = await demo.call_function(1, [3], iterator=output["iterator"])
        assert output["prediction"] == (0, 3)


class TestBatchProcessing:
    def test_raise_exception_if_batching_an_event_thats_not_queued(self):
        def trim(words, lens):
            trimmed_words = []
            for w, l in zip(words, lens):
                trimmed_words.append(w[: int(l)])
            return [trimmed_words]

        msg = "In order to use batching, the queue must be enabled."

        with pytest.raises(ValueError, match=msg):
            demo = gr.Interface(
                trim, ["textbox", "number"], ["textbox"], batch=True, max_batch_size=16
            )
            demo.launch(prevent_thread_lock=True)

        with pytest.raises(ValueError, match=msg):
            with gr.Blocks() as demo:
                with gr.Row():
                    word = gr.Textbox(label="word")
                    leng = gr.Number(label="leng")
                    output = gr.Textbox(label="Output")
                with gr.Row():
                    run = gr.Button()

                run.click(trim, [word, leng], output, batch=True, max_batch_size=16)
            demo.launch(prevent_thread_lock=True)

        with pytest.raises(ValueError, match=msg):
            with gr.Blocks() as demo:
                with gr.Row():
                    word = gr.Textbox(label="word")
                    leng = gr.Number(label="leng")
                    output = gr.Textbox(label="Output")
                with gr.Row():
                    run = gr.Button()

                run.click(
                    trim,
                    [word, leng],
                    output,
                    batch=True,
                    max_batch_size=16,
                    queue=False,
                )
            demo.queue()
            demo.launch(prevent_thread_lock=True)

    @pytest.mark.asyncio
    async def test_call_regular_function(self):
        def batch_fn(x):
            results = []
            for word in x:
                results.append("Hello " + word)
            return (results,)

        with gr.Blocks() as demo:
            text = gr.Textbox()
            btn = gr.Button()
            btn.click(batch_fn, inputs=text, outputs=text, batch=True)

        output = await demo.call_function(0, [["Adam", "Yahya"]])
        assert output["prediction"][0] == ["Hello Adam", "Hello Yahya"]
        output = demo("Abubakar")
        assert output == "Hello Abubakar"

    @pytest.mark.asyncio
    async def test_functions_multiple_parameters(self):
        def regular_fn(word1, word2):
            return len(word1) > len(word2)

        def batch_fn(words, lengths):
            comparisons = []
            trim_words = []
            for word, length in zip(words, lengths):
                trim_words.append(word[:length])
                comparisons.append(len(word) > length)
            return trim_words, comparisons

        with gr.Blocks() as demo:
            text1 = gr.Textbox()
            text2 = gr.Textbox()
            leng = gr.Number(precision=0)
            bigger = gr.Checkbox()
            btn1 = gr.Button("Check")
            btn2 = gr.Button("Trim")
            btn1.click(regular_fn, inputs=[text1, text2], outputs=bigger)
            btn2.click(
                batch_fn,
                inputs=[text1, leng],
                outputs=[text1, bigger],
                batch=True,
            )

        output = await demo.call_function(0, ["Adam", "Yahya"])
        assert output["prediction"] is False
        output = demo("Abubakar", "Abid")
        assert output

        output = await demo.call_function(1, [["Adam", "Mary"], [3, 5]])
        assert output["prediction"] == (
            ["Ada", "Mary"],
            [True, False],
        )
        output = demo("Abubakar", 3, fn_index=1)
        assert output == ["Abu", True]

    @pytest.mark.asyncio
    async def test_invalid_batch_generator(self):
        with pytest.raises(ValueError):

            def batch_fn(x):
                results = []
                for word in x:
                    results.append("Hello " + word)
                    yield (results,)

            with gr.Blocks() as demo:
                text = gr.Textbox()
                btn = gr.Button()
                btn.click(batch_fn, inputs=text, outputs=text, batch=True)

            await demo.process_api(0, [["Adam", "Yahya"]])

    @pytest.mark.asyncio
    async def test_exceeds_max_batch_size(self):
        with pytest.raises(ValueError):

            def batch_fn(x):
                results = []
                for word in x:
                    results.append("Hello " + word)
                return (results,)

            with gr.Blocks() as demo:
                text = gr.Textbox()
                btn = gr.Button()
                btn.click(
                    batch_fn, inputs=text, outputs=text, batch=True, max_batch_size=2
                )

            await demo.process_api(0, [["A", "B", "C"]])

    @pytest.mark.asyncio
    async def test_unequal_batch_sizes(self):
        with pytest.raises(ValueError):

            def batch_fn(x, y):
                results = []
                for word1, word2 in zip(x, y):
                    results.append("Hello " + word1 + word2)
                return (results,)

            with gr.Blocks() as demo:
                t1 = gr.Textbox()
                t2 = gr.Textbox()
                btn = gr.Button()
                btn.click(batch_fn, inputs=[t1, t2], outputs=t1, batch=True)

            await demo.process_api(0, [["A", "B", "C"], ["D", "E"]])


class TestSpecificUpdate:
    def test_without_update(self):
        with pytest.raises(KeyError):
            gr.Textbox.get_specific_update({"lines": 4})

    def test_with_update(self):
        specific_update = gr.Textbox.get_specific_update(
            {"lines": 4, "__type__": "update", "interactive": False}
        )
        assert specific_update == {
            "lines": 4,
            "max_lines": None,
            "placeholder": None,
            "label": None,
            "show_label": None,
            "type": None,
            "type": None,
            "visible": None,
            "value": gr.components._Keywords.NO_VALUE,
            "__type__": "update",
            "mode": "static",
        }

        specific_update = gr.Textbox.get_specific_update(
            {"lines": 4, "__type__": "update", "interactive": True}
        )
        assert specific_update == {
            "lines": 4,
            "max_lines": None,
            "placeholder": None,
            "label": None,
            "show_label": None,
            "type": None,
            "visible": None,
            "value": gr.components._Keywords.NO_VALUE,
            "__type__": "update",
            "mode": "dynamic",
        }

    def test_with_generic_update(self):
        specific_update = gr.Video.get_specific_update(
            {
                "visible": True,
                "value": "test.mp4",
                "__type__": "generic_update",
                "interactive": True,
            }
        )
        assert specific_update == {
            "source": None,
            "label": None,
            "show_label": None,
            "visible": True,
            "value": "test.mp4",
            "mode": "dynamic",
            "interactive": True,
            "__type__": "update",
        }

    @pytest.mark.asyncio
    async def test_accordion_update(self):
        with gr.Blocks() as demo:
            with gr.Accordion(label="Open for greeting", open=False) as accordion:
                gr.Textbox("Hello!")
            open_btn = gr.Button(label="Open Accordion")
            close_btn = gr.Button(label="Close Accordion")
            open_btn.click(
                lambda: gr.Accordion.update(open=True, label="Open Accordion"),
                inputs=None,
                outputs=[accordion],
            )
            close_btn.click(
                lambda: gr.Accordion.update(open=False, label="Closed Accordion"),
                inputs=None,
                outputs=[accordion],
            )
        result = await demo.process_api(fn_index=0, inputs=[None], request=None)
        assert result["data"][0] == {
            "open": True,
            "label": "Open Accordion",
            "__type__": "update",
        }
        result = await demo.process_api(fn_index=1, inputs=[None], request=None)
        assert result["data"][0] == {
            "open": False,
            "label": "Closed Accordion",
            "__type__": "update",
        }


class TestRender:
    def test_duplicate_error(self):
        with pytest.raises(DuplicateBlockError):
            t = gr.Textbox()
            with gr.Blocks():
                t.render()
                gr.Number()
                t.render()

        with pytest.raises(DuplicateBlockError):
            with gr.Blocks():
                t = gr.Textbox()
                t.render()

        with pytest.raises(DuplicateBlockError):
            io = gr.Interface(lambda x: x, gr.Textbox(), gr.Textbox())
            with gr.Blocks():
                io.render()
                io.render()

        with pytest.raises(DuplicateBlockError):
            t = gr.Textbox()
            io = gr.Interface(lambda x: x, t, gr.Textbox())
            with gr.Blocks():
                io.render()
                t.render()

    def test_no_error(self):
        t = gr.Textbox()
        t2 = gr.Textbox()
        with gr.Blocks():
            t.render()
            t3 = t2.render()
        assert t2 == t3

        t = gr.Textbox()
        io = gr.Interface(lambda x: x, t, gr.Textbox())
        with gr.Blocks():
            io.render()
            gr.Textbox()

        io = gr.Interface(lambda x: x, gr.Textbox(), gr.Textbox())
        io2 = gr.Interface(lambda x: x, gr.Textbox(), gr.Textbox())
        with gr.Blocks():
            io.render()
            io3 = io2.render()
        assert io2 == io3


class TestCancel:
    @pytest.mark.skipif(
        sys.version_info < (3, 8),
        reason="Tasks dont have names in 3.7",
    )
    @pytest.mark.asyncio
    async def test_cancel_function(self, capsys):
        async def long_job():
            await asyncio.sleep(10)
            print("HELLO FROM LONG JOB")

        with gr.Blocks() as demo:
            button = gr.Button(value="Start")
            click = button.click(long_job, None, None)
            cancel = gr.Button(value="Cancel")
            cancel.click(None, None, None, cancels=[click])

        cancel_fun = demo.fns[-1].fn
        task = asyncio.create_task(long_job())
        task.set_name("foo_0")
        # If cancel_fun didn't cancel long_job the message would be printed to the console
        # The test would also take 10 seconds
        await asyncio.gather(task, cancel_fun("foo"), return_exceptions=True)
        captured = capsys.readouterr()
        assert "HELLO FROM LONG JOB" not in captured.out

    @pytest.mark.skipif(
        sys.version_info < (3, 8),
        reason="Tasks dont have names in 3.7",
    )
    @pytest.mark.asyncio
    async def test_cancel_function_with_multiple_blocks(self, capsys):
        async def long_job():
            await asyncio.sleep(10)
            print("HELLO FROM LONG JOB")

        with gr.Blocks() as demo1:
            textbox = gr.Textbox()
            button1 = gr.Button(value="Start")
            button1.click(lambda x: x, textbox, textbox)
        with gr.Blocks() as demo2:
            button2 = gr.Button(value="Start")
            click = button2.click(long_job, None, None)
            cancel = gr.Button(value="Cancel")
            cancel.click(None, None, None, cancels=[click])

        with gr.Blocks() as demo:
            with gr.Tab("Demo 1"):
                demo1.render()
            with gr.Tab("Demo 2"):
                demo2.render()

        cancel_fun = demo.fns[-1].fn

        task = asyncio.create_task(long_job())
        task.set_name("foo_1")
        await asyncio.gather(task, cancel_fun("foo"), return_exceptions=True)
        captured = capsys.readouterr()
        assert "HELLO FROM LONG JOB" not in captured.out

    def test_raise_exception_if_cancelling_an_event_thats_not_queued(self):
        def iteration(a):
            yield a

        msg = "In order to cancel an event, the queue for that event must be enabled!"
        with pytest.raises(ValueError, match=msg):
            gr.Interface(iteration, inputs=gr.Number(), outputs=gr.Number()).launch(
                prevent_thread_lock=True
            )

        with pytest.raises(ValueError, match=msg):
            with gr.Blocks() as demo:
                button = gr.Button(value="Predict")
                click = button.click(None, None, None)
                cancel = gr.Button(value="Cancel")
                cancel.click(None, None, None, cancels=[click])
            demo.launch(prevent_thread_lock=True)

        with pytest.raises(ValueError, match=msg):
            with gr.Blocks() as demo:
                button = gr.Button(value="Predict")
                click = button.click(None, None, None, queue=False)
                cancel = gr.Button(value="Cancel")
                cancel.click(None, None, None, cancels=[click])
            demo.queue().launch(prevent_thread_lock=True)


class TestEvery:
    def test_raise_exception_if_parameters_invalid(self):
        with pytest.raises(
            ValueError, match="Cannot run change event in a batch and every 0.5 seconds"
        ):
            with gr.Blocks():
                num = gr.Number()
                num.change(
                    lambda s: s + 1, inputs=[num], outputs=[num], every=0.5, batch=True
                )

        with pytest.raises(
            ValueError, match="Parameter every must be positive or None"
        ):
            with gr.Blocks():
                num = gr.Number()
                num.change(lambda s: s + 1, inputs=[num], outputs=[num], every=-0.1)

    @pytest.mark.asyncio
    async def test_every_does_not_block_queue(self):

        with gr.Blocks() as demo:
            num = gr.Number(value=0)
            name = gr.Textbox()
            greeting = gr.Textbox()
            button = gr.Button(value="Greet")
            name.change(lambda n: n + random.random(), num, num, every=0.5)
            button.click(lambda s: f"Hello, {s}!", name, greeting)
        app, _, _ = demo.queue(max_size=1).launch(prevent_thread_lock=True)
        client = TestClient(app)

        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join"
        ) as ws:
            completed = False
            while not completed:
                msg = json.loads(await ws.recv())
                if msg["msg"] == "send_data":
                    await ws.send(json.dumps({"data": [0], "fn_index": 0}))
                if msg["msg"] == "send_hash":
                    await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
                    status = client.get("/queue/status")
                    # If the continuous event got pushed to the queue, the size would be nonzero
                    # asserting false will terminate the test
                    if status.json()["queue_size"] != 0:
                        assert False
                    else:
                        break


class TestAddRequests:
    def test_no_type_hints(self):
        def moo(a, b):
            return a + b

        inputs = [1, 2]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs

        boo = partial(moo, a=1)
        inputs = [2]
        inputs_ = gr.blocks.add_request_to_inputs(boo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs

    def test_no_type_hints_with_request(self):
        def moo(a: str, b: int):
            return a + str(b)

        inputs = ["abc", 2]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs

        boo = partial(moo, a="def")
        inputs = [2]
        inputs_ = gr.blocks.add_request_to_inputs(boo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs

    def test_type_hints_with_request(self):
        def moo(a: str, b: gr.Request):
            return a

        inputs = ["abc"]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs + [request]

        def moo(a: gr.Request, b, c: int):
            return c

        inputs = ["abc", 5]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == [request] + inputs

    def test_type_hints_with_multiple_requests(self):
        def moo(a: str, b: gr.Request, c: gr.Request):
            return a

        inputs = ["abc"]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == inputs + [request, request]

        def moo(a: gr.Request, b, c: int, d: gr.Request):
            return c

        inputs = ["abc", 5]
        request = gr.Request()
        inputs_ = gr.blocks.add_request_to_inputs(moo, copy.deepcopy(inputs), request)
        assert inputs_ == [request] + inputs + [request]


def test_queue_enabled_for_fn():
    with gr.Blocks() as demo:
        input = gr.Textbox()
        output = gr.Textbox()
        number = gr.Number()
        button = gr.Button()
        button.click(lambda x: f"Hello, {x}!", input, output)
        button.click(lambda: 42, None, number, queue=True)

    assert not demo.queue_enabled_for_fn(0)
    assert demo.queue_enabled_for_fn(1)
    demo.queue()
    assert demo.queue_enabled_for_fn(0)
    assert demo.queue_enabled_for_fn(1)


@pytest.mark.asyncio
async def test_queue_when_using_auth():
    sleep_time = 1

    async def say_hello(name):
        await asyncio.sleep(sleep_time)
        return f"Hello {name}!"

    with gr.Blocks() as demo:
        _input = gr.Textbox()
        _output = gr.Textbox()
        button = gr.Button()
        button.click(say_hello, _input, _output)
    demo.queue()
    app, _, _ = demo.launch(auth=("abc", "123"), prevent_thread_lock=True)
    client = TestClient(app)

    resp = client.post(
        f"{demo.local_url}login",
        data={"username": "abc", "password": "123"},
        follow_redirects=False,
    )
    assert resp.status_code == 302
    token = resp.cookies.get("access-token")
    assert token

    with pytest.raises(Exception) as e:
        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join",
        ) as ws:
            await ws.recv()
    assert e.type == websockets.InvalidStatusCode

    async def run_ws(_loop, _time, i):
        async with websockets.connect(
            f"{demo.local_url.replace('http', 'ws')}queue/join",
            extra_headers={"Cookie": f"access-token={token}"},
        ) as ws:
            while True:
                try:
                    msg = json.loads(await ws.recv())
                except websockets.ConnectionClosedOK:
                    break
                if msg["msg"] == "send_hash":
                    await ws.send(
                        json.dumps({"fn_index": 0, "session_hash": "enwpitpex2q"})
                    )
                if msg["msg"] == "send_data":
                    await ws.send(
                        json.dumps(
                            {
                                "data": [str(i)],
                                "fn_index": 0,
                                "session_hash": "enwpitpex2q",
                            }
                        )
                    )
                    msg = json.loads(await ws.recv())
                    assert msg["msg"] == "process_starts"
                if msg["msg"] == "process_completed":
                    assert msg["success"]
                    assert msg["output"]["data"] == [f"Hello {i}!"]
                    assert _loop.time() > _time
                    break

    loop = asyncio.get_event_loop()
    tm = loop.time()
    group = asyncio.gather(
        *[run_ws(loop, tm + sleep_time * (i + 1) - 0.3, i) for i in range(3)]
    )
    await group
