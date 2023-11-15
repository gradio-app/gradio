import asyncio
import copy
import io
import os
import pathlib
import random
import sys
import time
import unittest.mock as mock
import uuid
from concurrent.futures import wait
from contextlib import contextmanager
from functools import partial
from string import capwords
from unittest.mock import patch

import gradio_client as grc
import numpy as np
import pytest
import uvicorn
from fastapi.testclient import TestClient
from gradio_client import media_data
from PIL import Image

import gradio as gr
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import SelectData
from gradio.exceptions import DuplicateBlockError
from gradio.networking import Server, get_first_available_port
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

    def test_set_share_is_false_by_default(self):
        with gr.Blocks() as demo:
            assert not demo.share

    @patch("gradio.networking.setup_tunnel")
    @patch("gradio.utils.colab_check")
    def test_set_share_in_colab(self, mock_colab_check, mock_setup_tunnel):
        mock_colab_check.return_value = True
        mock_setup_tunnel.return_value = "http://localhost:7860/"
        with gr.Blocks() as demo:
            # self.share is False when instantiating the class
            assert not demo.share
            # share default is True, if share is None in colab and queueing
            demo.launch(prevent_thread_lock=True)
            assert demo.share
            demo.close()
            # share is also true, if share is None in colab with queueing
            demo.queue()
            demo.launch(prevent_thread_lock=True)
            assert demo.share
            demo.close()

    def test_load_from_config(self):
        fake_url = "https://fake.hf.space"

        def update(name):
            return f"Welcome to Gradio, {name}!"

        with gr.Blocks() as demo1:
            inp = gr.Textbox(placeholder="What is your name?")
            out = gr.Textbox()

            inp.submit(fn=update, inputs=inp, outputs=out, api_name="greet")

            gr.Image(height=54, width=240)

        config1 = demo1.get_config_file()
        demo2 = gr.Blocks.from_config(config1, [update], "https://fake.hf.space")

        for component in config1["components"]:
            component["props"]["proxy_url"] = f"{fake_url}/"
        config2 = demo2.get_config_file()

        assert assert_configs_are_equivalent_besides_ids(config1, config2)

    def test_partial_fn_in_config(self):
        def greet(name, formatter):
            return formatter(f"Hello {name}!")

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

        result = await demo.process_api(
            inputs=["huggy", "face"], fn_index=0, state=None
        )
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
            result = await demo.process_api(inputs=[1], fn_index=0, state=None)
            end = time.time()
            difference = end - start
            assert difference >= 0.01
            assert result

    @mock.patch("gradio.analytics._do_analytics_request")
    def test_initiated_analytics(self, mock_anlaytics, monkeypatch):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        with gr.Blocks():
            pass
        mock_anlaytics.assert_called_once()

    @mock.patch("gradio.analytics._do_analytics_request")
    def test_launch_analytics_does_not_error_with_invalid_blocks(
        self, mock_anlaytics, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        with gr.Blocks():
            t1 = gr.Textbox()

        with gr.Blocks() as demo:
            t2 = gr.Textbox()
            t2.change(lambda x: x, t2, t1)

        demo.launch(prevent_thread_lock=True)
        mock_anlaytics.assert_called()

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

    def test_custom_css(self):
        css = """
            .gr-button {
                color: white;
                border-color: black;
                background: black;
            }
        """
        css = css * 5  # simulate a long css string
        block = gr.Blocks(css=css)

        assert block.css == css

    @pytest.mark.asyncio
    async def test_restart_after_close(self, connect):
        io = gr.Interface(lambda s: s, gr.Textbox(), gr.Textbox()).queue()

        with connect(io) as client:
            assert client.predict("freddy", api_name="/predict") == "freddy"
        # connect launches the interface which is what we need to test
        with connect(io) as client:
            assert client.predict("Victor", api_name="/predict") == "Victor"

    @pytest.mark.asyncio
    async def test_async_generators(self, connect):
        async def async_iteration(count: int):
            for i in range(count):
                yield i
                await asyncio.sleep(0.2)

        def iteration(count: int):
            for i in range(count):
                yield i
                time.sleep(0.2)

        with gr.Blocks() as demo:
            with gr.Row():
                with gr.Column():
                    num1 = gr.Number(value=4, precision=0)
                    o1 = gr.Number()
                    async_iterate = gr.Button(value="Async Iteration")
                    async_iterate.click(
                        async_iteration,
                        num1,
                        o1,
                        concurrency_limit=2,
                        concurrency_id="main",
                    )
                with gr.Column():
                    num2 = gr.Number(value=4, precision=0)
                    o2 = gr.Number()
                    iterate = gr.Button(value="Iterate")
                    iterate.click(iteration, num2, o2, concurrency_id="main")

        with connect(demo) as client:
            job_1 = client.submit(3, fn_index=0)
            job_2 = client.submit(4, fn_index=1)
            wait([job_1, job_2])

            assert job_1.outputs()[-1] == 2
            assert job_2.outputs()[-1] == 3

    def test_async_generators_interface(self, connect):
        async def async_iteration(count: int):
            for i in range(count):
                yield i
                await asyncio.sleep(0.2)

        demo = gr.Interface(
            async_iteration, gr.Number(precision=0), gr.Number()
        ).queue()
        outputs = []
        with connect(demo) as client:
            for output in client.submit(3, api_name="/predict"):
                outputs.append(output)
        assert outputs == [0, 1, 2]

    def test_sync_generators(self, connect):
        def generator(string):
            yield from string

        demo = gr.Interface(generator, "text", "text").queue()
        outputs = []
        with connect(demo) as client:
            for output in client.submit("abc", api_name="/predict"):
                outputs.append(output)
        assert outputs == ["a", "b", "c"]
        demo.queue().launch(prevent_thread_lock=True)

    def test_socket_reuse(self):
        try:
            io = gr.Interface(lambda x: x, gr.Textbox(), gr.Textbox())
            io.launch(server_port=9441, prevent_thread_lock=True)
            io.close()
            io.launch(server_port=9441, prevent_thread_lock=True)
        finally:
            io.close()

    def test_function_types_documented_in_config(self):
        def continuous_fn():
            return 42

        def generator_function():
            yield from range(10)

        with gr.Blocks() as demo:
            gr.Number(value=lambda: 2, every=2)
            meaning_of_life = gr.Number()
            counter = gr.Number()
            generator_btn = gr.Button(value="Generate")
            greeting = gr.Textbox()
            greet_btn = gr.Button(value="Greet")

            greet_btn.click(lambda: "Hello!", inputs=None, outputs=[greeting])
            generator_btn.click(generator_function, inputs=None, outputs=[counter])
            demo.load(continuous_fn, inputs=None, outputs=[meaning_of_life], every=1)

        for i, dependency in enumerate(demo.config["dependencies"]):
            if i == 3:
                assert dependency["types"] == {"continuous": True, "generator": True}
            if i == 0:
                assert dependency["types"] == {"continuous": False, "generator": False}
            if i == 1:
                assert dependency["types"] == {"continuous": False, "generator": True}
            if i == 2:
                assert dependency["types"] == {"continuous": True, "generator": True}

    @pytest.mark.asyncio
    async def test_run_without_launching(self):
        """Test that we can start the app and use queue without calling .launch().

        This is essentially what the 'gradio' reload mode does
        """

        port = get_first_available_port(7860, 7870)

        io = gr.Interface(lambda s: s, gr.Textbox(), gr.Textbox()).queue()

        config = uvicorn.Config(app=io.app, port=port, log_level="warning")

        server = Server(config=config)
        server.run_in_thread()

        try:
            client = grc.Client(f"http://localhost:{port}")
            result = client.predict("Victor", api_name="/predict")
            assert result == "Victor"
        finally:
            server.close()

    @patch(
        "gradio.themes.ThemeClass.from_hub",
        side_effect=ValueError("Something went wrong!"),
    )
    def test_use_default_theme_as_fallback(self, mock_from_hub):
        with pytest.warns(
            UserWarning, match="Cannot load freddyaboulton/this-theme-does-not-exist"
        ):
            with gr.Blocks(theme="freddyaboulton/this-theme-does-not-exist") as demo:
                assert demo.theme.to_dict() == gr.themes.Default().to_dict()

    def test_exit_called_at_launch(self):
        with gr.Blocks() as demo:
            gr.Textbox(uuid.uuid4)
        demo.launch(prevent_thread_lock=True)
        assert len(demo.get_config_file()["dependencies"]) == 1


class TestTempFile:
    def test_pil_images_hashed(self, connect, gradio_temp_dir):
        images = [
            Image.new("RGB", (512, 512), color) for color in ("red", "green", "blue")
        ]

        def create_images(n_images):
            return random.sample(images, n_images)

        gallery = gr.Gallery()
        demo = gr.Interface(
            create_images,
            inputs="slider",
            outputs=gallery,
        )
        with connect(demo) as client:
            client.predict(3, api_name="/predict")
            _ = client.predict(3, api_name="/predict")
        # only three files created and in temp directory
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 3

    def test_no_empty_image_files(self, gradio_temp_dir, connect):
        file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        image = str(file_dir / "bus.png")

        demo = gr.Interface(
            lambda x: x,
            inputs=gr.Image(type="filepath"),
            outputs=gr.Image(),
        )
        with connect(demo) as client:
            _ = client.predict(image, api_name="/predict")
            _ = client.predict(image, api_name="/predict")
            _ = client.predict(image, api_name="/predict")
        # Upload creates a file. image preprocessing creates another one.
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2

    @pytest.mark.parametrize("component", [gr.UploadButton, gr.File])
    def test_file_component_uploads(self, component, connect, gradio_temp_dir):
        code_file = str(pathlib.Path(__file__))
        demo = gr.Interface(lambda x: x.name, component(), gr.File())
        with connect(demo) as client:
            _ = client.predict(code_file, api_name="/predict")
            _ = client.predict(code_file, api_name="/predict")
        # the upload route hashees the files so we get 1 from there
        # We create two tempfiles (empty) because API says we return
        # preprocess/postprocess will create the same file as the upload route
        # so 1 + 2 = 3
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 3

    def test_no_empty_video_files(self, gradio_temp_dir, connect):
        file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        video = str(file_dir / "video_sample.mp4")
        demo = gr.Interface(lambda x: x, gr.Video(), gr.Video())
        with connect(demo) as client:
            _ = client.predict({"video": video}, api_name="/predict")
            _ = client.predict({"video": video}, api_name="/predict")
        # Upload route and postprocessing return the same file
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

    def test_no_empty_audio_files(self, gradio_temp_dir, connect):
        file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        audio = str(file_dir / "audio_sample.wav")

        def reverse_audio(audio):
            sr, data = audio
            return (sr, np.flipud(data))

        demo = gr.Interface(fn=reverse_audio, inputs=gr.Audio(), outputs=gr.Audio())
        with connect(demo) as client:
            _ = client.predict(audio, api_name="/predict")
            _ = client.predict(audio, api_name="/predict")
            # One for upload and one for reversal
            assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2


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
            if isinstance(component, gr.components.Component):
                if "Non-random" in component.label:
                    assert not component.load_event_to_attach
                else:
                    assert component.load_event_to_attach
        dependencies_on_load = [
            dep["targets"][0][1] == "load" for dep in demo.config["dependencies"]
        ]
        assert all(dependencies_on_load)
        assert len(dependencies_on_load) == 2
        # Queue should be explicitly false for these events
        assert all(dep["queue"] is False for dep in demo.config["dependencies"])

    def test_io_components_attach_load_events_when_value_is_fn(self, io_components):
        io_components = [comp for comp in io_components if comp not in [gr.State]]
        interface = gr.Interface(
            lambda *args: None,
            inputs=[comp(value=lambda: None, every=1) for comp in io_components],
            outputs=None,
        )

        dependencies_on_load = [
            dep
            for dep in interface.config["dependencies"]
            if dep["targets"][0][1] == "load"
        ]
        assert len(dependencies_on_load) == len(io_components)
        assert all(dep["every"] == 1 for dep in dependencies_on_load)

    def test_get_load_events(self, io_components):
        components = []
        with gr.Blocks() as demo:
            for component in io_components:
                components.append(component(value=lambda: None, every=1))
        assert all(comp.load_event in demo.dependencies for comp in components)


class TestBlocksPostprocessing:
    def test_blocks_do_not_filter_none_values_from_updates(self, io_components):
        io_components = [
            c()
            for c in io_components
            if c
            not in [
                gr.State,
                gr.Button,
                gr.ScatterPlot,
                gr.LinePlot,
                gr.BarPlot,
                gr.components.Fallback,
                gr.FileExplorer,
            ]
        ]
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

        def process_and_dump(component):
            output = component.postprocess(None)
            if isinstance(output, (GradioModel, GradioRootModel)):
                output = output.model_dump()
            return output

        assert all(
            o["value"] == process_and_dump(c) for o, c in zip(output, io_components)
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

    def test_blocks_does_not_del_dict_keys_inplace(self):
        with gr.Blocks() as demo:
            im_list = [gr.Image() for i in range(2)]

            def change_visibility(value):
                return [gr.update(visible=value)] * 2

            checkbox = gr.Checkbox(value=True, label="Show image")
            checkbox.change(change_visibility, inputs=checkbox, outputs=im_list)

        output = demo.postprocess_data(0, [gr.update(visible=False)] * 2, state=None)
        assert output == [
            {"visible": False, "__type__": "update"},
            {"visible": False, "__type__": "update"},
        ]

    def test_blocks_returns_correct_output_dict_single_key(self):
        with gr.Blocks() as demo:
            num = gr.Number()
            num2 = gr.Number()
            update = gr.Button(value="update")

            def update_values(val):
                return {num2: gr.Number(value=42)}

            update.click(update_values, inputs=[num], outputs=[num2])

        output = demo.postprocess_data(0, {num2: gr.Number(value=42)}, state=None)
        assert output[0]["value"] == 42

        output = demo.postprocess_data(0, {num2: 23}, state=None)
        assert output[0] == 23

    @pytest.mark.asyncio
    async def test_blocks_update_dict_without_postprocessing(self):
        def infer(x):
            return media_data.BASE64_IMAGE, gr.update(visible=True)

        with gr.Blocks() as demo:
            prompt = gr.Textbox()
            image = gr.Image()
            run_button = gr.Button()
            share_button = gr.Button("share", visible=False)
            run_button.click(infer, prompt, [image, share_button], postprocess=False)

        output = await demo.process_api(0, ["test"], state=None)
        assert output["data"][0] == media_data.BASE64_IMAGE
        assert output["data"][1] == {"__type__": "update", "visible": True}

    @pytest.mark.asyncio
    async def test_blocks_update_dict_does_not_postprocess_value_if_postprocessing_false(
        self,
    ):
        def infer(x):
            return gr.Image(value=media_data.BASE64_IMAGE)

        with gr.Blocks() as demo:
            prompt = gr.Textbox()
            image = gr.Image()
            run_button = gr.Button()
            run_button.click(infer, [prompt], [image], postprocess=False)

        output = await demo.process_api(0, ["test"], state=None)
        assert output["data"][0] == {
            "__type__": "update",
            "value": media_data.BASE64_IMAGE,
        }

    @pytest.mark.asyncio
    async def test_blocks_update_interactive(
        self,
    ):
        def specific_update():
            return [
                gr.Image(interactive=True),
                gr.Textbox(interactive=True),
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
            output = await demo.process_api(fn_index, [], state=None)
            assert output["data"][0] == {
                "__type__": "update",
                "interactive": True,
            }
            assert output["data"][1] == {"__type__": "update", "interactive": True}

    def test_error_raised_if_num_outputs_mismatch(self):
        with gr.Blocks() as demo:
            textbox1 = gr.Textbox()
            textbox2 = gr.Textbox()
            button = gr.Button()
            button.click(lambda x: x, textbox1, [textbox1, textbox2])
        with pytest.raises(
            ValueError,
            match=r'An event handler didn\'t receive enough output values \(needed: 2, received: 1\)\.\nWanted outputs:\n    \[textbox, textbox\]\nReceived outputs:\n    \["test"\]',
        ):
            demo.postprocess_data(fn_index=0, predictions=["test"], state=None)

    def test_error_raised_if_num_outputs_mismatch_with_function_name(self):
        def infer(x):
            return x

        with gr.Blocks() as demo:
            textbox1 = gr.Textbox()
            textbox2 = gr.Textbox()
            button = gr.Button()
            button.click(infer, textbox1, [textbox1, textbox2])
        with pytest.raises(
            ValueError,
            match=r'An event handler \(infer\) didn\'t receive enough output values \(needed: 2, received: 1\)\.\nWanted outputs:\n    \[textbox, textbox\]\nReceived outputs:\n    \["test"\]',
        ):
            demo.postprocess_data(fn_index=0, predictions=["test"], state=None)

    def test_error_raised_if_num_outputs_mismatch_single_output(self):
        with gr.Blocks() as demo:
            num1 = gr.Number()
            num2 = gr.Number()
            btn = gr.Button(value="1")
            btn.click(lambda a: a, num1, [num1, num2])
        with pytest.raises(
            ValueError,
            match=r"An event handler didn\'t receive enough output values \(needed: 2, received: 1\)\.\nWanted outputs:\n    \[number, number\]\nReceived outputs:\n    \[1\]",
        ):
            demo.postprocess_data(fn_index=0, predictions=1, state=None)

    def test_error_raised_if_num_outputs_mismatch_tuple_output(self):
        def infer(a, b):
            return a, b

        with gr.Blocks() as demo:
            num1 = gr.Number()
            num2 = gr.Number()
            num3 = gr.Number()
            btn = gr.Button(value="1")
            btn.click(infer, num1, [num1, num2, num3])
        with pytest.raises(
            ValueError,
            match=r"An event handler \(infer\) didn\'t receive enough output values \(needed: 3, received: 2\)\.\nWanted outputs:\n    \[number, number, number\]\nReceived outputs:\n    \[1, 2\]",
        ):
            demo.postprocess_data(fn_index=0, predictions=(1, 2), state=None)


class TestStateHolder:
    @pytest.mark.asyncio
    async def test_state_stored_up_to_capacity(self):
        with gr.Blocks() as demo:
            num = gr.Number()
            state = gr.State(value=0)

            def run(x, s):
                return s, s + 1

            num.submit(
                run,
                inputs=[num, state],
                outputs=[num, state],
            )
        app, _, _ = demo.launch(prevent_thread_lock=True, state_session_capacity=2)
        client = TestClient(app)

        session_1 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "1", "fn_index": 0},
        )
        assert session_1.json()["data"][0] == 0
        session_2 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "2", "fn_index": 0},
        )
        assert session_2.json()["data"][0] == 0
        session_1 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "1", "fn_index": 0},
        )
        assert session_1.json()["data"][0] == 1
        session_2 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "2", "fn_index": 0},
        )
        assert session_2.json()["data"][0] == 1
        session_3 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "3", "fn_index": 0},
        )
        assert session_3.json()["data"][0] == 0
        session_2 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "2", "fn_index": 0},
        )
        assert session_2.json()["data"][0] == 2
        session_1 = client.post(
            "/api/predict/",
            json={"data": [1, None], "session_hash": "1", "fn_index": 0},
        )
        assert (
            session_1.json()["data"][0] == 0
        )  # state was lost for session 1 when session 3 was added, since state_session_capacity=2

    @pytest.mark.asyncio
    async def test_updates_stored_up_to_capacity(self):
        with gr.Blocks() as demo:
            min = gr.Number()
            num = gr.Number()

            def run(min, num):
                return min, gr.Number(value=num, minimum=min)

            num.submit(
                run,
                inputs=[min, num],
                outputs=[min, num],
            )
        app, _, _ = demo.launch(prevent_thread_lock=True, state_session_capacity=2)
        client = TestClient(app)

        session_1 = client.post(
            "/api/predict/", json={"data": [5, 5], "session_hash": "1", "fn_index": 0}
        )
        assert session_1.json()["data"][0] == 5
        session_1 = client.post(
            "/api/predict/", json={"data": [2, 2], "session_hash": "1", "fn_index": 0}
        )
        assert "error" in session_1.json()  # error because min is 5 and num is 2
        session_2 = client.post(
            "/api/predict/", json={"data": [5, 5], "session_hash": "2", "fn_index": 0}
        )
        assert session_2.json()["data"][0] == 5
        session_3 = client.post(
            "/api/predict/", json={"data": [5, 5], "session_hash": "3", "fn_index": 0}
        )
        assert session_3.json()["data"][0] == 5
        session_1 = client.post(
            "/api/predict/", json={"data": [2, 2], "session_hash": "1", "fn_index": 0}
        )
        assert (
            "error" not in session_1.json()
        )  # no error because sesssion 1 block config was lost when session 3 was added


class TestCallFunction:
    @pytest.mark.asyncio
    async def test_call_regular_function(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            btn = gr.Button()
            btn.click(
                lambda x: f"Hello, {x}",
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
                lambda x: f"Hello, {x}",
                inputs=text,
                outputs=text,
            )
            text.change(
                lambda x: f"Hi, {x}",
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
    async def test_call_decorated_functions(self):
        with gr.Blocks() as demo:
            name = gr.Textbox(value="Abubakar")
            output = gr.Textbox(label="Output Box")

            @name.submit(inputs=name, outputs=output)
            @demo.load(inputs=name, outputs=output)
            def test(x):
                return "Hello " + x

        output = await demo.call_function(0, ["Adam"])
        assert output["prediction"] == "Hello Adam"
        output = await demo.call_function(1, ["Adam"])
        assert output["prediction"] == "Hello Adam"

    @pytest.mark.asyncio
    async def test_call_generator(self):
        def generator(x):
            yield from range(x)

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
            trimmed_words = [word[: int(length)] for word, length in zip(words, lens)]
            return [trimmed_words]

        msg = "In order to use batching, the queue must be enabled."

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
                results.append(f"Hello {word}")
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
                    results.append(f"Hello {word}")
                    yield (results,)

            with gr.Blocks() as demo:
                text = gr.Textbox()
                btn = gr.Button()
                btn.click(batch_fn, inputs=text, outputs=text, batch=True)

            await demo.process_api(0, [["Adam", "Yahya"]], state=None)

    @pytest.mark.asyncio
    async def test_exceeds_max_batch_size(self):
        with pytest.raises(ValueError):

            def batch_fn(x):
                results = []
                for word in x:
                    results.append(f"Hello {word}")
                return (results,)

            with gr.Blocks() as demo:
                text = gr.Textbox()
                btn = gr.Button()
                btn.click(
                    batch_fn, inputs=text, outputs=text, batch=True, max_batch_size=2
                )

            await demo.process_api(0, [["A", "B", "C"]], state=None)

    @pytest.mark.asyncio
    async def test_unequal_batch_sizes(self):
        with pytest.raises(ValueError):

            def batch_fn(x, y):
                results = []
                for word1, word2 in zip(x, y):
                    results.append(f"Hello {word1}{word2}")
                return (results,)

            with gr.Blocks() as demo:
                t1 = gr.Textbox()
                t2 = gr.Textbox()
                btn = gr.Button()
                btn.click(batch_fn, inputs=[t1, t2], outputs=t1, batch=True)

            await demo.process_api(0, [["A", "B", "C"], ["D", "E"]], state=None)


class TestUpdate:
    @pytest.mark.asyncio
    async def test_accordion_update(self):
        with gr.Blocks() as demo:
            with gr.Accordion(label="Open for greeting", open=False) as accordion:
                gr.Textbox("Hello!")
            open_btn = gr.Button("Open Accordion")
            close_btn = gr.Button("Close Accordion")
            open_btn.click(
                lambda: gr.Accordion(open=True, label="Open Accordion"),
                inputs=None,
                outputs=[accordion],
            )
            close_btn.click(
                lambda: gr.Accordion(open=False, label="Closed Accordion"),
                inputs=None,
                outputs=[accordion],
            )
        result = await demo.process_api(
            fn_index=0, inputs=[None], request=None, state=None
        )
        assert result["data"][0] == {
            "open": True,
            "label": "Open Accordion",
            "__type__": "update",
        }
        result = await demo.process_api(
            fn_index=1, inputs=[None], request=None, state=None
        )
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

    def test_is_rendered(self):
        t = gr.Textbox()
        with gr.Blocks():
            pass
        assert not t.is_rendered

        t = gr.Textbox()
        with gr.Blocks():
            t.render()
        assert t.is_rendered

        t = gr.Textbox()
        with gr.Blocks():
            t.render()
            t.unrender()
        assert not t.is_rendered

        with gr.Blocks():
            t = gr.Textbox()
        assert t.is_rendered

        with gr.Blocks():
            t = gr.Textbox()
        with gr.Blocks():
            pass
        assert t.is_rendered

        t = gr.Textbox()
        gr.Interface(lambda x: x, "textbox", t)
        assert t.is_rendered

    def test_no_error_if_state_rendered_multiple_times(self):
        state = gr.State("")
        gr.TabbedInterface(
            [
                gr.Interface(
                    lambda _, x: (x, "I don't know"),
                    inputs=[state, gr.Textbox()],
                    outputs=[state, gr.Textbox()],
                ),
                gr.Interface(
                    lambda s: (s, f"User question: {s}"),
                    inputs=[state],
                    outputs=[state, gr.Textbox(interactive=False)],
                ),
            ],
            ["Ask question", "Show question"],
        )


class TestCancel:
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

        msg = "Queue needs to be enabled!"

        with pytest.raises(ValueError, match=msg):
            with gr.Blocks() as demo:
                button = gr.Button(value="Predict")
                click = button.click(None, None, None)
                cancel = gr.Button(value="Cancel")
                cancel.click(None, None, None, cancels=[click], queue=False)
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
            ValueError, match="Cannot run event in a batch and every 0.5 seconds"
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


class TestGetAPIInfo:
    def test_many_endpoints(self):
        with gr.Blocks() as demo:
            t1 = gr.Textbox()
            t2 = gr.Textbox()
            t3 = gr.Textbox()
            t4 = gr.Textbox()
            t5 = gr.Textbox()
            t1.change(lambda x: x, t1, t2, api_name="change1")
            t2.change(lambda x: x, t2, t3, api_name="change2")
            t3.change(lambda x: x, t3, t4, api_name=False)
            t4.change(lambda x: x, t4, t5, api_name=False)

        api_info = demo.get_api_info()
        assert len(api_info["named_endpoints"]) == 2
        assert len(api_info["unnamed_endpoints"]) == 0

    def test_no_endpoints(self):
        with gr.Blocks() as demo:
            t1 = gr.Textbox()
            t2 = gr.Textbox()
            t1.change(lambda x: x, t1, t2, api_name=False)

        api_info = demo.get_api_info()
        assert len(api_info["named_endpoints"]) == 0
        assert len(api_info["unnamed_endpoints"]) == 0


class TestAddRequests:
    def test_no_type_hints(self):
        def moo(a, b):
            return a + b

        inputs = [1, 2]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs

        boo = partial(moo, a=1)
        inputs = [2]
        inputs_ = gr.helpers.special_args(boo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs

    def test_no_type_hints_with_request(self):
        def moo(a: str, b: int):
            return a + str(b)

        inputs = ["abc", 2]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs

        boo = partial(moo, a="def")
        inputs = [2]
        inputs_ = gr.helpers.special_args(boo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs

    def test_type_hints_with_request(self):
        def moo(a: str, b: gr.Request):
            return a

        inputs = ["abc"]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs + [request]

        def moo(a: gr.Request, b, c: int):
            return c

        inputs = ["abc", 5]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == [request] + inputs

    def test_type_hints_with_multiple_requests(self):
        def moo(a: str, b: gr.Request, c: gr.Request):
            return a

        inputs = ["abc"]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs + [request, request]

        def moo(a: gr.Request, b, c: int, d: gr.Request):
            return c

        inputs = ["abc", 5]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == [request] + inputs + [request]

    def test_default_args(self):
        def moo(a, b, c=42):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs + [42]

        inputs = [1, 2, 24]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs

    def test_default_args_with_progress(self):
        pr = gr.Progress()

        def moo(a, b, c=42, pr=pr):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_, progress_index, _ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request
        )
        assert inputs_ == inputs + [42, pr]
        assert progress_index == 3

        inputs = [1, 2, 24]
        request = gr.Request()
        inputs_, progress_index, _ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request
        )
        assert inputs_ == inputs + [pr]
        assert progress_index == 3

        def moo(a, b, pr=pr, c=42):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_, progress_index, _ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request
        )
        assert inputs_ == inputs + [pr, 42]
        assert progress_index == 2

    def test_default_args_with_request(self):
        pr = gr.Progress()

        def moo(a, b, req: gr.Request, c=42):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(moo, copy.deepcopy(inputs), request)[0]
        assert inputs_ == inputs + [request, 42]

        def moo(a, b, req: gr.Request, c=42, pr=pr):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_, progress_index, _ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request
        )
        assert inputs_ == inputs + [request, 42, pr]
        assert progress_index == 4

    def test_default_args_with_event_data(self):
        pr = gr.Progress()
        target = gr.Textbox()

        def moo(a, b, ed: SelectData, c=42):
            return a + b + c

        event_data = SelectData(target=target, data={"index": 24, "value": "foo"})
        inputs = [1, 2]
        request = gr.Request()
        inputs_ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request, event_data
        )[0]
        assert len(inputs_) == 4
        new_event_data = inputs_[2]
        assert inputs_ == inputs + [new_event_data, 42]
        assert isinstance(new_event_data, SelectData)
        assert new_event_data.target == target
        assert new_event_data.index == 24
        assert new_event_data.value == "foo"

        def moo(a, b, ed: SelectData, c=42, pr=pr):
            return a + b + c

        inputs = [1, 2]
        request = gr.Request()
        inputs_, progress_index, _ = gr.helpers.special_args(
            moo, copy.deepcopy(inputs), request, event_data
        )
        assert len(inputs_) == 5
        new_event_data = inputs_[2]
        assert inputs_ == inputs + [new_event_data, 42, pr]
        assert progress_index == 4
        assert isinstance(new_event_data, SelectData)
        assert new_event_data.target == target
        assert new_event_data.index == 24
        assert new_event_data.value == "foo"


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

    with pytest.raises(ValueError):
        grc.Client(f"http://localhost:{demo.server_port}")

    client = grc.Client(f"http://localhost:{demo.server_port}", auth=("abc", "123"))
    jobs = []
    for i in range(3):
        jobs.append(client.submit(f"World {i}", fn_index=0))

    for i, job in enumerate(jobs):
        assert job.result() == f"Hello World {i}!"


def test_temp_file_sets_get_extended():
    test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")

    with gr.Blocks() as demo1:
        gr.Video(str(test_file_dir / "video_sample.mp4"))

    with gr.Blocks() as demo2:
        gr.Audio(str(test_file_dir / "audio_sample.wav"))

    with gr.Blocks() as demo3:
        demo1.render()
        demo2.render()

    assert demo3.temp_file_sets == demo1.temp_file_sets + demo2.temp_file_sets


def test_recover_kwargs():
    audio = gr.Audio(format="wav", autoplay=True)
    props = audio.recover_kwargs(
        {"format": "wav", "value": "foo.wav", "autoplay": False, "foo": "bar"}
    )
    assert props == {"format": "wav", "value": "foo.wav", "autoplay": False}
    props = audio.recover_kwargs(
        {"format": "wav", "value": "foo.wav", "autoplay": False, "foo": "bar"},
        ["value"],
    )
    assert props == {"format": "wav", "autoplay": False}


def test_deprecation_warning_emitted_when_concurrency_count_set():
    with pytest.raises(DeprecationWarning):
        gr.Interface(lambda x: x, gr.Textbox(), gr.Textbox()).queue(
            concurrency_count=12
        )


def test_postprocess_update_dict():
    block = gr.Textbox()
    update_dict = {"value": 2.0, "visible": True, "invalid_arg": "hello"}
    assert gr.blocks.postprocess_update_dict(block, update_dict, True) == {
        "__type__": "update",
        "value": "2.0",
        "visible": True,
    }

    block = gr.Textbox(lines=10)
    update_dict = {"value": 2.0, "lines": 10}
    assert gr.blocks.postprocess_update_dict(block, update_dict, False) == {
        "__type__": "update",
        "value": 2.0,
        "lines": 10,
    }

    block = gr.Dropdown(choices=["New Country A", "New Country B"])
    update_dict = {
        "value": "New Country A",
        "choices": ["New Country A", "New Country B"],
    }
    assert gr.blocks.postprocess_update_dict(block, update_dict, False) == {
        "__type__": "update",
        "value": "New Country A",
        "choices": [
            ("New Country A", "New Country A"),
            ("New Country B", "New Country B"),
        ],
    }


def test_async_iterator_update_with_new_component(connect):
    async def get_number_stream():
        for i in range(10):
            yield gr.Number(value=i, label="Number (updates every second)")

            await asyncio.sleep(0.1)

    demo = gr.Interface(fn=get_number_stream, inputs=None, outputs=["number"])
    demo.queue()

    with connect(demo) as client:
        job = client.submit(api_name="/predict")
        job.result()
        assert [r["value"] for r in job.outputs()] == list(range(10))
