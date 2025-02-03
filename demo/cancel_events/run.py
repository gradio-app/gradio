import time
import gradio as gr
import atexit
import pathlib

log_file = pathlib.Path(__file__).parent / "cancel_events_output_log.txt"

def fake_diffusion(steps):
    log_file.write_text("")
    for i in range(steps):
        print(f"Current step: {i}")
        with log_file.open("a") as f:
            f.write(f"Current step: {i}\n")
        time.sleep(0.2)
        yield str(i)

def long_prediction(*args, **kwargs):
    time.sleep(4)
    return 42, 42

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            n = gr.Slider(1, 10, value=9, step=1, label="Number Steps")
            run = gr.Button(value="Start Iterating")
            output = gr.Textbox(label="Iterative Output")
            stop = gr.Button(value="Stop Iterating")
        with gr.Column():
            textbox = gr.Textbox(label="Prompt")
            loading_box = gr.Textbox(label="Loading indicator for expensive calculation")
            loading_box2 = gr.Textbox(label="Loading indicator for expensive calculation")
            prediction = gr.Number(label="Expensive Calculation")
            prediction2 = gr.Number(label="Expensive Calculation")
            run_pred = gr.Button(value="Run Expensive Calculation")
        with gr.Column():
            cancel_on_change = gr.Textbox(
                label="Cancel Iteration and Expensive Calculation on Change"
            )
            cancel_on_submit = gr.Textbox(
                label="Cancel Iteration and Expensive Calculation on Submit"
            )
            echo = gr.Textbox(label="Echo")
    with gr.Row():
        with gr.Column():
            image = gr.Image(
                sources=["webcam"], label="Cancel on clear", interactive=True
            )
        with gr.Column():
            video = gr.Video(
                sources=["webcam"], label="Cancel on start recording", interactive=True
            )

    click_event = run.click(fake_diffusion, n, output)
    stop.click(fn=None, inputs=None, outputs=None, cancels=[click_event])
    pred_event = run_pred.click(
        fn=long_prediction, inputs=[textbox], outputs=[prediction, prediction2], show_progress_on=[loading_box, loading_box2]
    )

    cancel_on_change.change(None, None, None, cancels=[click_event, pred_event])
    cancel_on_submit.submit(
        lambda s: s, cancel_on_submit, echo, cancels=[click_event, pred_event]
    )
    image.clear(None, None, None, cancels=[click_event, pred_event])
    video.start_recording(None, None, None, cancels=[click_event, pred_event])

    demo.queue(max_size=20)
    atexit.register(lambda: log_file.unlink())

if __name__ == "__main__":
    demo.launch()
