import gradio as gr
from gradio.media import get_image, get_video

with gr.Blocks() as demo:
    gallery_items = [
        ("https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg", "cheetah1"),
        ("https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg", "cheetah2"),
        ("https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4", "world"),
        (get_image("cheetah.jpg"), "cheetah3"),
        (get_video("world.mp4"), "world2")
    ]
    gr.Gallery(value=gallery_items, columns=4)

demo.launch()
