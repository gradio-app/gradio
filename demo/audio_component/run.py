# import gradio as gr

# css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

# with gr.Blocks(css=css) as demo:
#     gr.Audio()

# demo.launch()


import gradio as gr

with gr.Blocks(analytics_enabled=False) as interface:
    with gr.Row():
        with gr.Tab('Chat history'):
            with gr.Row():
                with gr.Column():
                    gr.Markdown('Upload')
                    upload_chat_history = gr.File(type='binary', file_types=['.json', '.txt'])
                with gr.Column():
                    gr.Markdown('Download')
                    download = gr.File()
                    download_button = gr.Button(value='Click me')

interface.launch()