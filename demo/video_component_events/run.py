import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_video = gr.Video(label="Input Video")
        with gr.Column():
            output_video = gr.Video(label="Output Video")
        with gr.Column():
            num_change = gr.Number(label="# Change Events", value=0)
            num_load = gr.Number(label="# Upload Events", value=0)
            num_play = gr.Number(label="# Play Events", value=0)
            num_pause = gr.Number(label="# Pause Events", value=0)
        input_video.upload(lambda s, n: (s, n + 1), [input_video, num_load], [output_video, num_load])
        input_video.change(lambda n: n + 1, num_change, num_change)
        input_video.play(lambda n: n + 1, num_play, num_play)
        input_video.pause(lambda n: n + 1, num_pause, num_pause)
        input_video.change(lambda n: n + 1, num_change, num_change)

if __name__ == "__main__":
    demo.launch()
