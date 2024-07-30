import gradio as gr
from data import df

with gr.Blocks() as demo:
    with gr.Row():
        gr.Label(len(df), label="Flight Count")
        gr.Label(f"${df['price'].min()}", label="Cheapest Flight")
    gr.DataFrame(df)

    
if __name__ == "__main__":
    demo.launch()