import gradio as gr

df = [[f"{i}-{j}" for j in range(0, 2)] for i in range(0, 5)]

with gr.Blocks() as demo:
    gr.DataFrame(df, headers=list(range(1, 11)), interactive=True)

if __name__ == "__main__":
    demo.launch()