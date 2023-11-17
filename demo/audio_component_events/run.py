import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_video = gr.Audio(type="filepath", label="Input Audio", sources=["upload", "microphone"])
        with gr.Column():
            output_video = gr.Audio(label="Output Audio", sources=["upload", "microphone"])

    with gr.Row():
        with gr.Column():
            input_num_change = gr.Number(label="# Input Change Events", value=0)
            input_num_load = gr.Number(label="# Input Upload Events", value=0)
            input_num_play = gr.Number(label="# Input Play Events", value=0)
            input_num_pause = gr.Number(label="# Input Pause Events", value=0)

        with gr.Column():
            output_num_play = gr.Number(label="# Output Play Events", value=0)
            output_num_pause = gr.Number(label="# Output Pause Events", value=0)
            output_num_stop = gr.Number(label="# Output Stop Events", value=0)

            input_video.upload(lambda s, n: (s, n + 1), [input_video, input_num_load], [output_video, input_num_load])
            input_video.change(lambda n: n + 1, input_num_change, input_num_change)
            input_video.play(lambda n: n + 1, input_num_play, input_num_play)
            input_video.pause(lambda n: n + 1, input_num_pause, input_num_pause)
            input_video.change(lambda n: n + 1, input_num_change, input_num_change)

            output_video.play(lambda n: n + 1, output_num_play, output_num_play)
            output_video.pause(lambda n: n + 1, output_num_pause, output_num_pause)
            output_video.stop(lambda n: n + 1, output_num_stop, output_num_stop)



if __name__ == "__main__":
    demo.launch()