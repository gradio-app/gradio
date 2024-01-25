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
            gal = gr.Gallery(columns=4, interactive=True)
        with gr.Column():
            output_gal = gr.Gallery()
    with gr.Row():
        textbox = gr.Json(label="uploaded files")
        num_upload = gr.Number(value=0, label="Num Upload")
        num_change = gr.Number(value=0, label="Num Change")
        gal.upload(lambda v,n: (v, v, n+1), [gal, num_upload], [textbox, output_gal, num_upload])
        gal.change(lambda v,n: (v, v, n+1), [gal, num_change], [textbox, output_gal, num_change])

demo.launch()