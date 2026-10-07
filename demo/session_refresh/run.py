import time

import gradio as gr


def start():
    return 0, "Welcome"


def add(count):
    return count + 1, f"Count: {count + 1}"


def run(count):
    for step in range(1, 6):
        time.sleep(0.5)
        yield f"Step {step} of 5 (count {count})"


def finish(count):
    return count + 100, f"Finished: {count + 100}"


with gr.Blocks() as demo:
    count = gr.State()
    total = gr.Textbox(label="Total")
    progress = gr.Textbox(label="Progress")
    gr.Button("Add").click(add, count, [count, total])
    gr.Button("Run").click(run, count, progress).then(finish, count, [count, total])
    demo.load(start, None, [count, total])

if __name__ == "__main__":
    demo.launch()
