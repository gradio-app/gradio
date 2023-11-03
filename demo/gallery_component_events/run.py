import gradio as gr 

with gr.Blocks() as demo:
    cheetahs = [
        "https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg",
        "https://img.etimg.com/thumb/msid-50159822,width-650,imgsize-129520,,resizemode-4,quality-100/.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-002.jpg",
        "https://images.theconversation.com/files/375893/original/file-20201218-13-a8h8uq.jpg?ixlib=rb-1.1.0&rect=16%2C407%2C5515%2C2924&q=45&auto=format&w=496&fit=clip",
    ]
    with gr.Row():
        with gr.Column():
            btn = gr.Button()
        with gr.Column():
            gallery = gr.Gallery()
        with gr.Column():
            select_output = gr.Textbox(label="Select Data")
        btn.click(lambda: cheetahs, None, [gallery])
        def select(select_data: gr.SelectData):
            return select_data.value['image']['url']
        gallery.select(select, None, select_output)

if __name__ == "__main__":
    demo.launch()