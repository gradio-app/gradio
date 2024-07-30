import gradio as gr

with gr.Blocks() as demo:
    gr.DownloadButton("📂 Click to download file", value="http://www.marketingtool.online/en/face-generator/img/faces/avatar-1151ce9f4b2043de0d2e3b7826127998.jpg")

if __name__ == "__main__":
    demo.launch()
