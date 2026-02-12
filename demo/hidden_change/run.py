import gradio as gr
import time
import random


def screen_data(data, n):
    entry = data.get(f"{n}", {})
    ts = entry.get("timestamp", "unknown time")
    msg = entry.get("message", "unknown message")
    return f"At {ts}, JS says: “{msg}”"


def increment_counter(counter):
    return counter + 1


def update_hidden_json(hidden_json, n):
    new_n = n + 1
    return {
        **hidden_json,
        f"{new_n}": {"timestamp": time.time(), "message": f"number {new_n + 1}"},
    }, new_n


with gr.Blocks() as demo:
    with gr.Tab(label="hidden component"):
        n = gr.State(0)

        hidden_json = gr.JSON(visible=False)

        display = gr.Textbox(label="Screened Output")

        demo.load(
            fn=None,
            js="""
            () => {
                const data = {
                    "0": {
                    message: "Hello from client JS! Number 1",
                    timestamp: new Date().toLocaleTimeString()
                    },
                    
                };
                return data;  // this goes into hidden_json
            }
            """,
            outputs=[hidden_json],
        )

        counter = gr.Number(label="Counter", value=0)
        hidden_json.change(fn=increment_counter, inputs=[counter], outputs=[counter])
        hidden_json.change(fn=screen_data, inputs=[hidden_json, n], outputs=[display])
        button = gr.Button("Update hidden_json")
        button.click(
            fn=update_hidden_json, inputs=[hidden_json, n], outputs=[hidden_json, n]
        )

    with gr.Tab(label="same data"):
        btnA = gr.Button("A")
        boxA = gr.Textbox()
        btnA.click(lambda: "A", outputs=boxA)

        btnB = gr.Button("B")
        boxB = gr.Textbox(visible=False)
        btnB.click(lambda x: x, boxA, boxB)

        with gr.Row():
            num1 = gr.Textbox(label="Text A")
            num2 = gr.Textbox(label="Text B")

        boxA.change(random.random, outputs=num1)
        boxB.change(random.random, outputs=num2)

    with gr.Tab(label="hidden parent"):
        btnA = gr.Button("A")
        boxA = gr.Textbox()
        btnA.click(lambda: "A", outputs=boxA)
        btnB = gr.Button("B")
        with gr.Row(visible=False):
            boxB = gr.Textbox()
        btnB.click(lambda x: x, boxA, boxB)

        with gr.Row():
            num1 = gr.Textbox(label="Text A")
            num2 = gr.Textbox(label="Text B")

        boxA.change(random.random, outputs=num1)
        boxB.change(random.random, outputs=num2)

if __name__ == "__main__":
    demo.launch()
