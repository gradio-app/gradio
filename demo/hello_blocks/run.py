import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    button_set = gr.HTML(
        value="freddy",
        html_template="""
        ${value}
        <button>A</button>
        <button>B</button>
        <button>C</button>
        """,
        css_template="""
        button {
            padding: 10px;
            background-color: red;
        }
        """,
        js_on_load="""
        const buttons = element.querySelectorAll('button');
        console.log(1)
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('clicked', button.innerText);
                trigger('click', {clicked: button.innerText});
            });
        });
        """,
    )
    update_value = gr.Button("Update Value")
    update_value.click(lambda: "new value from python", outputs=button_set)
    clicked_box = gr.Textbox()

    def on_button_click(evt: gr.EventData):
        return evt.clicked

    button_set.click(on_button_click, outputs=clicked_box)

if __name__ == "__main__":
    demo.launch()
