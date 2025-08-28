import gradio as gr

with gr.Blocks() as demo:
    gallery_items = [
        ("https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg", "cheetah1"),
        ("https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg", "cheetah2"),
        ("https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4", "world"),
        ("files/cheetah.jpg", "cheetah3"),
        ("files/world.mp4", "world2")
    ]
    gr.Gallery(value=gallery_items, columns=4)

demo.launch()
