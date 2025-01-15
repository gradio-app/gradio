import gradio as gr
import pandas as pd
import time

def update_dataframe(df):
    df.iloc[:, :] = 1
    yield df, 1
    time.sleep(1)
    df.iloc[:, :] = 2
    yield df, 2

initial_df = pd.DataFrame(0, index=range(5), columns=range(5))

with gr.Blocks() as demo:
    with gr.Row():
        button = gr.Button("Update DataFrame")
        number = gr.Number(value=0, label="Number")
    dataframe = gr.Dataframe(value=initial_df, label="Dataframe")
    counter = gr.Number(value=0, label="Counter")
    button.click(fn=update_dataframe, inputs=dataframe, outputs=[dataframe, number])

    dataframe.change(fn=lambda x:x+1, inputs=[counter], outputs=[counter])

if __name__ == "__main__":
    demo.launch()
