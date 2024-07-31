import inspect
import random
import time

import gradio as gr
import pytest
from pydub import AudioSegment


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "flaky: mark test as flaky. Failure will not cause te"
    )


@pytest.fixture
def calculator_demo():
    def calculator(num1, operation, num2):
        if operation == "add":
            return num1 + num2
        elif operation == "subtract":
            return num1 - num2
        elif operation == "multiply":
            return num1 * num2
        elif operation == "divide":
            if num2 == 0:
                raise gr.Error("Cannot divide by zero!")
            return num1 / num2

    demo = gr.Interface(
        calculator,
        ["number", gr.Radio(["add", "subtract", "multiply", "divide"]), "number"],
        "number",
        examples=[
            [5, "add", 3],
            [4, "divide", 2],
            [-4, "multiply", 2.5],
            [0, "subtract", 1.2],
        ],
    )
    return demo


@pytest.fixture
def calculator_demo_with_defaults():
    def calculator(num1, operation=None, num2=100):
        if operation is None or operation == "add":
            return num1 + num2
        elif operation == "subtract":
            return num1 - num2
        elif operation == "multiply":
            return num1 * num2
        elif operation == "divide":
            if num2 == 0:
                raise gr.Error("Cannot divide by zero!")
            return num1 / num2

    demo = gr.Interface(
        calculator,
        [
            gr.Number(value=10),
            gr.Radio(["add", "subtract", "multiply", "divide"]),
            gr.Number(),
        ],
        "number",
        examples=[
            [5, "add", 3],
            [4, "divide", 2],
            [-4, "multiply", 2.5],
            [0, "subtract", 1.2],
        ],
    )
    return demo


@pytest.fixture
def state_demo():
    state = gr.State(delete_callback=lambda x: print("STATE DELETED"))
    demo = gr.Interface(
        lambda x, y: (x, y),
        ["textbox", state],
        ["textbox", state],
    )
    return demo


@pytest.fixture
def increment_demo():
    with gr.Blocks() as demo:
        btn1 = gr.Button("Increment")
        btn2 = gr.Button("Increment")
        btn3 = gr.Button("Increment")
        numb = gr.Number()

        state = gr.State(0)

        btn1.click(
            lambda x: (x + 1, x + 1),
            state,
            [state, numb],
            api_name="increment_with_queue",
        )
        btn2.click(
            lambda x: (x + 1, x + 1),
            state,
            [state, numb],
            queue=False,
            api_name="increment_without_queue",
        )
        btn3.click(
            lambda x: (x + 1, x + 1),
            state,
            [state, numb],
            api_name=False,
        )

    return demo


@pytest.fixture
def progress_demo():
    def my_function(x, progress=gr.Progress()):
        progress(0, desc="Starting...")
        for _ in progress.tqdm(range(20)):
            time.sleep(0.1)
        return x

    return gr.Interface(my_function, gr.Textbox(), gr.Textbox())


@pytest.fixture
def yield_demo():
    def spell(x):
        for i in range(len(x)):
            time.sleep(0.5)
            yield x[:i]

    return gr.Interface(spell, "textbox", "textbox")


@pytest.fixture
def cancel_from_client_demo():
    def iteration():
        for i in range(20):
            print(f"i: {i}")
            yield i
            time.sleep(0.5)

    def long_process():
        time.sleep(10)
        print("DONE!")
        return 10

    with gr.Blocks() as demo:
        num = gr.Number()

        btn = gr.Button(value="Iterate")
        btn.click(iteration, None, num, api_name="iterate")
        btn2 = gr.Button(value="Long Process")
        btn2.click(long_process, None, num, api_name="long")

    return demo


@pytest.fixture
def sentiment_classification_demo():
    def classifier(text):  # noqa: ARG001
        time.sleep(1)
        return {label: random.random() for label in ["POSITIVE", "NEGATIVE", "NEUTRAL"]}

    def sleep_for_test():
        time.sleep(10)
        return 2

    with gr.Blocks(theme="gstaff/xkcd") as demo:
        with gr.Row():
            with gr.Column():
                input_text = gr.Textbox(label="Input Text")
                with gr.Row():
                    classify = gr.Button("Classify Sentiment")
            with gr.Column():
                label = gr.Label(label="Predicted Sentiment")
            number = gr.Number()
            btn = gr.Button("Sleep then print")
        classify.click(classifier, input_text, label, api_name="classify")
        btn.click(sleep_for_test, None, number, api_name="sleep")

    return demo


@pytest.fixture
def count_generator_demo():
    def count(n):
        for i in range(int(n)):
            time.sleep(0.5)
            yield i

    def show(n):
        return str(list(range(int(n))))

    with gr.Blocks() as demo:
        with gr.Column():
            num = gr.Number(value=10)
            with gr.Row():
                count_btn = gr.Button("Count")
                list_btn = gr.Button("List")
        with gr.Column():
            out = gr.Textbox()

        count_btn.click(count, num, out)
        list_btn.click(show, num, out)

    return demo


@pytest.fixture
def count_generator_no_api():
    def count(n):
        for i in range(int(n)):
            time.sleep(0.5)
            yield i

    def show(n):
        return str(list(range(int(n))))

    with gr.Blocks() as demo:
        with gr.Column():
            num = gr.Number(value=10)
            with gr.Row():
                count_btn = gr.Button("Count")
                list_btn = gr.Button("List")
        with gr.Column():
            out = gr.Textbox()

        count_btn.click(count, num, out, api_name=False)
        list_btn.click(show, num, out, api_name=False)

    return demo


@pytest.fixture
def count_generator_demo_exception():
    def count(n):
        for i in range(int(n)):
            time.sleep(0.01)
            if i == 5:
                raise ValueError("Oh no!")
            yield i

    def show(n):
        return str(list(range(int(n))))

    with gr.Blocks() as demo:
        with gr.Column():
            num = gr.Number(value=10)
            with gr.Row():
                count_btn = gr.Button("Count")
        with gr.Column():
            out = gr.Textbox()

        count_btn.click(count, num, out, api_name="count")
    return demo


@pytest.fixture
def file_io_demo():
    demo = gr.Interface(
        lambda _: print("foox"),
        [gr.File(file_count="multiple"), "file"],
        [gr.File(file_count="multiple"), "file"],
    )

    return demo


@pytest.fixture
def stateful_chatbot():
    with gr.Blocks() as demo:
        chatbot = gr.Chatbot()
        msg = gr.Textbox()
        clear = gr.Button("Clear")
        st = gr.State([1, 2, 3])

        def respond(message, st, chat_history):
            assert st[0] == 1 and st[1] == 2 and st[2] == 3
            bot_message = "I love you"
            chat_history.append((message, bot_message))
            return "", chat_history

        msg.submit(respond, [msg, st, chatbot], [msg, chatbot], api_name="submit")
        clear.click(lambda: None, None, chatbot, queue=False)
    return demo


@pytest.fixture
def hello_world_with_group():
    with gr.Blocks() as demo:
        name = gr.Textbox(label="name")
        output = gr.Textbox(label="greeting")
        greet = gr.Button("Greet")
        show_group = gr.Button("Show group")
        with gr.Group(visible=False) as group:
            gr.Textbox("Hello!")

        def greeting(name):
            return f"Hello {name}", gr.Group(visible=True)

        greet.click(
            greeting, inputs=[name], outputs=[output, group], api_name="greeting"
        )
        show_group.click(
            lambda: gr.Group(visible=False), None, group, api_name="show_group"
        )
    return demo


@pytest.fixture
def hello_world_with_state_and_accordion():
    with gr.Blocks() as demo:
        with gr.Row():
            name = gr.Textbox(label="name")
            output = gr.Textbox(label="greeting")
            num = gr.Number(label="count")
        with gr.Row():
            n_counts = gr.State(value=0)
            greet = gr.Button("Greet")
            open_acc = gr.Button("Open acc")
            close_acc = gr.Button("Close acc")
        with gr.Accordion(label="Extra stuff", open=False) as accordion:
            gr.Textbox("Hello!")

        def greeting(name, state):
            state += 1
            return state, f"Hello {name}", state, gr.Accordion(open=False)

        greet.click(
            greeting,
            inputs=[name, n_counts],
            outputs=[n_counts, output, num, accordion],
            api_name="greeting",
        )
        open_acc.click(
            lambda state: (state + 1, state + 1, gr.Accordion(open=True)),
            [n_counts],
            [n_counts, num, accordion],
            api_name="open",
        )
        close_acc.click(
            lambda state: (state + 1, state + 1, gr.Accordion(open=False)),
            [n_counts],
            [n_counts, num, accordion],
            api_name="close",
        )
    return demo


@pytest.fixture
def stream_audio():
    import pathlib
    import tempfile

    def _stream_audio(audio_file):
        audio = AudioSegment.from_mp3(audio_file)
        i = 0
        chunk_size = 3000

        while chunk_size * i < len(audio):
            chunk = audio[chunk_size * i : chunk_size * (i + 1)]
            i += 1
            if chunk:
                file = str(pathlib.Path(tempfile.gettempdir()) / f"{i}.wav")
                chunk.export(file, format="wav")
                yield file

    return gr.Interface(
        fn=_stream_audio,
        inputs=gr.Audio(type="filepath", label="Audio file to stream"),
        outputs=gr.Audio(autoplay=True, streaming=True),
    )


@pytest.fixture
def video_component():
    return gr.Interface(fn=lambda x: x, inputs=gr.Video(), outputs=gr.Video())


@pytest.fixture
def all_components():
    classes_to_check = gr.components.Component.__subclasses__()
    subclasses = []

    while classes_to_check:
        subclass = classes_to_check.pop()
        children = subclass.__subclasses__()

        if children:
            classes_to_check.extend(children)
        if (
            "value" in inspect.signature(subclass).parameters
            and subclass != gr.components.Component
            and not getattr(subclass, "is_template", False)
        ):
            subclasses.append(subclass)

    return subclasses


@pytest.fixture(autouse=True)
def gradio_temp_dir(monkeypatch, tmp_path):
    """tmp_path is unique to each test function.
    It will be cleared automatically according to pytest docs: https://docs.pytest.org/en/6.2.x/reference.html#tmp-path
    """
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    return tmp_path


@pytest.fixture
def long_response_with_info():
    def long_response(_):
        gr.Info("Beginning long response")
        time.sleep(17)
        gr.Info("Done!")
        return "\ta\nb" * 90000

    return gr.Interface(
        long_response,
        None,
        gr.Textbox(label="Output"),
    )


@pytest.fixture
def many_endpoint_demo():
    with gr.Blocks() as demo:

        def noop(x):
            return x

        n_elements = 1000
        for _ in range(n_elements):
            msg2 = gr.Textbox()
            msg2.submit(noop, msg2, msg2)
            butn2 = gr.Button()
            butn2.click(noop, msg2, msg2)

    return demo


@pytest.fixture
def max_file_size_demo():
    with gr.Blocks() as demo:
        file_1b = gr.File()
        upload_status = gr.Textbox()

        file_1b.upload(
            lambda x: "Upload successful", file_1b, upload_status, api_name="upload_1b"
        )

    return demo


@pytest.fixture
def chatbot_message_format():
    with gr.Blocks() as demo:
        chatbot = gr.Chatbot(type="messages")
        msg = gr.Textbox()

        def respond(message, chat_history: list):
            bot_message = random.choice(
                ["How are you?", "I love you", "I'm very hungry"]
            )
            chat_history.extend(
                [
                    {"role": "user", "content": message},
                    {"role": "assistant", "content": bot_message},
                ]
            )
            return "", chat_history

        msg.submit(respond, [msg, chatbot], [msg, chatbot], api_name="chat")

    return demo
