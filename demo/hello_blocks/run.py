import gradio as gr
import time

df = [[f"col: {i} -- row:{j}" for j in range(1, 11)] for i in range(1, 10000)]

def run():
    time.sleep(1)
    return df

with gr.Blocks() as demo:
    d = gr.DataFrame([[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3],], headers=list(range(1, 11)), interactive=True)
    b = gr.Button('Run')
    b.click(run, outputs=[d])

if __name__ == "__main__":
    demo.launch()