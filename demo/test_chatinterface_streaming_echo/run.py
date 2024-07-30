import gradio as gr

runs = 0

def slow_echo(message, history):
    global runs  # i didn't want to add state or anything to this demo
    runs = runs + 1
    for i in range(len(message)):
        yield f"Run {runs} - You typed: " + message[: i + 1]

demo = gr.ChatInterface(slow_echo)

if __name__ == "__main__":
    demo.launch()
