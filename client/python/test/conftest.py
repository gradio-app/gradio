import inspect
import random
import time

import gradio as gr
import pytest


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
    return demo.queue()


@pytest.fixture
def state_demo():
    demo = gr.Interface(
        lambda x, y: (x, y),
        ["textbox", "state"],
        ["textbox", "state"],
    )
    return demo.queue()


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

    return demo.queue()


@pytest.fixture
def progress_demo():
    def my_function(x, progress=gr.Progress()):
        progress(0, desc="Starting...")
        for _ in progress.tqdm(range(20)):
            time.sleep(0.1)
        return x

    return gr.Interface(my_function, gr.Textbox(), gr.Textbox()).queue()


@pytest.fixture
def yield_demo():
    def spell(x):
        for i in range(len(x)):
            time.sleep(0.5)
            yield x[:i]

    return gr.Interface(spell, "textbox", "textbox").queue()


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

    return demo.queue(concurrency_count=40)


@pytest.fixture
def sentiment_classification_demo():
    def classifier(text):
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

    return demo.queue()


@pytest.fixture
def count_generator_demo_exception():
    def count(n):
        for i in range(int(n)):
            time.sleep(0.1)
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
                count_forever = gr.Button("Count forever")
        with gr.Column():
            out = gr.Textbox()

        count_btn.click(count, num, out, api_name="count")
        count_forever.click(show, num, out, api_name="count_forever", every=3)
    return demo.queue()


@pytest.fixture
def file_io_demo():
    demo = gr.Interface(
        lambda x: print("foox"),
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
        demo.queue()
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
            return f"Hello {name}", gr.Group.update(visible=True)

        greet.click(
            greeting, inputs=[name], outputs=[output, group], api_name="greeting"
        )
        show_group.click(
            lambda: gr.Group.update(visible=False), None, group, api_name="show_group"
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
            return state, f"Hello {name}", state, gr.Accordion.update(open=False)

        greet.click(
            greeting,
            inputs=[name, n_counts],
            outputs=[n_counts, output, num, accordion],
            api_name="greeting",
        )
        open_acc.click(
            lambda state: (state + 1, state + 1, gr.Accordion.update(open=True)),
            [n_counts],
            [n_counts, num, accordion],
            api_name="open",
        )
        close_acc.click(
            lambda state: (state + 1, state + 1, gr.Accordion.update(open=False)),
            [n_counts],
            [n_counts, num, accordion],
            api_name="close",
        )
    return demo


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
            and subclass != gr.components.IOComponent
            and not getattr(subclass, "is_template", False)
        ):
            subclasses.append(subclass)

    return subclasses
