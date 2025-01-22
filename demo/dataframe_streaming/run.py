import gradio as gr
import pandas as pd
import time

def update_dataframe(df):
    df.iloc[:, :] = 1
    yield df, 1
    time.sleep(0.1)
    df.iloc[:, :] = 2
    yield df, 2

def sum_values(df):
    return pd.to_numeric(df.values.flatten(), errors='coerce').sum()

initial_df = pd.DataFrame(0, index=range(5), columns=range(5))

with gr.Blocks() as demo:
    with gr.Row():
        button = gr.Button("Update DataFrame")
        number = gr.Number(value=0, label="Number")
    dataframe = gr.Dataframe(value=initial_df, label="Dataframe")

    button.click(fn=update_dataframe, inputs=dataframe, outputs=[dataframe, number])
    with gr.Row():
        change_events = gr.Number(label="Change events")
        input_events = gr.Number(label="Input events")
        sum_of_values = gr.Number(label="Sum of values")

    dataframe.change(lambda x:x+1, inputs=change_events, outputs=change_events)
    dataframe.input(lambda x:x+1, inputs=input_events, outputs=input_events)
    dataframe.change(sum_values, inputs=dataframe, outputs=sum_of_values)

if __name__ == "__main__":
    demo.launch()
