import gradio as gr

runs = 0

def reset_runs():
    global runs
    runs = 0

def slow_echo(message, history):
    global runs  # i didn't want to add state or anything to this demo
    runs = runs + 1
    return f"Run {runs} - You typed: " + message['text']

chat = gr.ChatInterface(slow_echo, multimodal=True, type="tuples")

with gr.Blocks() as demo:
    chat.render()
    # We reset the global variable to minimize flakes
    # this works because CI runs only one test at at time
    # need to use gr.State if we want to parallelize this test
    # currently chatinterface does not support that
    demo.unload(reset_runs)

if __name__ == "__main__":
    demo.launch()
