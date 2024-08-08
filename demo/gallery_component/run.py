import gradio as gr

with gr.Blocks() as demo:
    cheetahs = [
        "https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg",
        "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
        "files/cheetah.jpg",
        "files/world.mp4"
    ]
    gr.Gallery(value=cheetahs, columns=4)

demo.launch()
