import gradio as gr

def store_message(message: str, history: list[str]):  # type: ignore
    output = {
        "Current messages": message,
        "Previous messages": history[::-1]
    }
    history.append(message)
    return output, history

demo = gr.Interface(fn=store_message,
                    inputs=["textbox", gr.State(value=[])],
                    outputs=["json", gr.State()])

if __name__ == "__main__":
    demo.launch()
