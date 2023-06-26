import gradio as gr

TEST_AUDIO_A = "a.wav"
TEST_AUDIO_B = "b.mp3"

audio_files = [TEST_AUDIO_A, TEST_AUDIO_B]
idx = 0

def output():
    global idx
    file = audio_files[idx]
    idx = 1 if idx == 0 else 0
    print(idx)
    return file

with gr.Blocks() as demo:
    audio = gr.Audio(type="filepath", label="Audio", autoplay=True)
    button = gr.Button(value="play")
    button.click(output, outputs=[audio])
    
demo.launch()