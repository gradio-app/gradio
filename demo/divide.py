import gradio as gr

def divide(num1):
    return num1/0

iface = gr.Interface(fn=divide, inputs="number", outputs="number")
if __name__ == "__main__":
    iface.launch(debug=True)