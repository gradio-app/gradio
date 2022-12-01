import gradio as gr
import random
import time


with gr.Blocks() as demo:
    btn = gr.Button("Go")
    progress = gr.ProgressBar(visible=False)
    num = gr.Number()

    def dummy():
        yield {progress: gr.ProgressBar.update(value=0, visible=True)}
        total_duration = random.randint(3, 10)
        duration = 0
        while duration < total_duration:
            yield {progress: duration / total_duration}
            time.sleep(1)
            duration += 1
        yield {
            progress: gr.ProgressBar.update(visible=False),
            num: random.randint(0, 100),
        }

    btn.click(dummy, None, {num, progress})


if __name__ == "__main__":
    demo.queue().launch()
