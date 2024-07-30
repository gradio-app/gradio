import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_audio = gr.Audio(type="filepath", label="Input Audio", sources=["upload", "microphone"])
        with gr.Column():
            output_audio = gr.Audio(label="Output Audio", sources=["upload", "microphone"])

    with gr.Row():
        with gr.Column():
            input_num_change = gr.Number(label="# Input Change Events", value=0)
            input_num_input = gr.Number(label="# Input Input Events", value=0)
            input_num_load = gr.Number(label="# Input Upload Events", value=0)
            input_num_play = gr.Number(label="# Input Play Events", value=0)
            input_num_pause = gr.Number(label="# Input Pause Events", value=0)

        with gr.Column():
            input_record = gr.Number(label="# Input Start Recording Events", value=0)
            input_pause = gr.Number(label="# Input Pause Recording Events", value=0)
            input_stop = gr.Number(label="# Input Stop Recording Events", value=0)

        with gr.Column():
            output_num_play = gr.Number(label="# Output Play Events", value=0)
            output_num_pause = gr.Number(label="# Output Pause Events", value=0)
            output_num_stop = gr.Number(label="# Output Stop Events", value=0)

            input_audio.upload(lambda s, n: (s, n + 1), [input_audio, input_num_load], [output_audio, input_num_load])
            input_audio.change(lambda n: n + 1, input_num_change, input_num_change)
            input_audio.play(lambda n: n + 1, input_num_play, input_num_play)
            input_audio.pause(lambda n: n + 1, input_num_pause, input_num_pause)
            input_audio.change(lambda n: n + 1, input_num_change, input_num_change)
            input_audio.input(lambda n: n + 1, input_num_input, input_num_input)

            input_audio.start_recording(lambda n: n + 1, input_record, input_record)
            input_audio.pause_recording(lambda n: n + 1, input_pause, input_pause)
            input_audio.stop_recording(lambda n: n + 1, input_stop, input_stop)

            output_audio.play(lambda n: n + 1, output_num_play, output_num_play)
            output_audio.pause(lambda n: n + 1, output_num_pause, output_num_pause)
            output_audio.stop(lambda n: n + 1, output_num_stop, output_num_stop)

if __name__ == "__main__":
    demo.launch()
