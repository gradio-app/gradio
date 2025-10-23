import gradio as gr


with gr.Blocks() as demo:
    gr.Markdown("""
    # Simple HTML usecase
    This is the classic `gr.HTML` usecase where we just want to render some static HTML.
    """)
    simple_html = gr.HTML("<h1 style='color:purple;'>Hello, World!</h1>")

    gr.Markdown("""
    # Templated HTML usecase
    'value' can now be anything, and it can be used inside the `html_template` using `${value}` syntax.
    Note that when used as output or input, `value` is just this specific value rather than the entire HTML.
    """)
    with gr.Row():
        name1 = gr.Textbox(label="Name")
        templated_html = gr.HTML("", html_template="<h1>Hello, ${value}! ${value.length} letters</h1>")
        name1.change(lambda x: x, inputs=name1, outputs=templated_html)

    gr.Markdown("""
    # Additional Props
    You are not limited to using `${value}` in the templates, you can add any number of custom tags to the template, and pass them to the component as keyword arguments. These props can be updated via python event listeners as well.
    """)
    with gr.Row():
        templated_html_props = gr.HTML("John", html_template="""
                            <h1 style="font-size: ${fontSize}px;">Hello, ${value}!</h1>
                """, fontSize=30)
        slider = gr.Slider(10, 100, value=30, label="Font Size")
        slider.change(lambda x: gr.HTML(fontSize=x), inputs=slider, outputs=templated_html_props)

    gr.Markdown("""
    # CSS Templating
    We can also template CSS, which is automatically scoped to the component.
    """)
    with gr.Row():
        name2 = gr.Textbox(label="Name")
        color = gr.ColorPicker(label="Text Color", value="#00ff00")
        bold = gr.Checkbox(label="Bold Text", value=True)
        templated_html_css = gr.HTML("John", html_template="""
                        <h1>Hello, ${value}!</h1>
                        <ul>
                          ${value.split('').map(c => `<li>${c}</li>`).join('')}
                        </ul>
            """, css_template="""
            h1, ul {
                color: ${color};
                font-weight: ${bold ? 'bold' : 'normal'};
            }
        """, color="green", bold=True)
    with gr.Row():
        btn = gr.Button("Update HTML")
        btn_blue = gr.Button("Make HTML Blue")
    def update_templated_html_css(name, color, bold):
        return gr.HTML(value=name, color=color, bold=bold)
    btn.click(update_templated_html_css, inputs=[name2, color, bold], outputs=templated_html_css)
    btn_blue.click(lambda: gr.HTML(color="blue"), outputs=templated_html_css)

    gr.Markdown("""
    # JS Prop Updates
    We can now trigger events from gr.HTML using event listeners in `js_on_load`. This script has access to `element` which refers to the parent element, and `trigger(event_name)` or `trigger(event_name, event_data)`, which can be used to dispatch events.
    """)

    button_set = gr.HTML(
        html_template="""
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
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                trigger('click', {clicked: button.innerText});
            });
        });
        """,
    )
    clicked_box = gr.Textbox()

    def on_button_click(evt: gr.EventData):
        return evt.clicked
    
    button_set.click(on_button_click, outputs=clicked_box)

    gr.Markdown("""
    # JS Prop Changes
    You can also update `value` or any other prop of the component from JS using `props`, e.g., `props.value = "new value"` will update the `value` prop and re-render the HTML template.
    """)    
    form = gr.HTML(
        html_template="""
        <input type="text" value="${value}">
        <p>${value.length} letters</p>
        ${valid ? '<button class="submit">submit</button>' : ''}
        <button class="clear">clear</button>
        """,
        js_on_load="""
        const input = element.querySelector('input');
        const submit_button = element.querySelector('button.submit');
        const clear_button = element.querySelector('button.clear');
        input.addEventListener('input', () => {
            props.value = input.value;
            props.valid = input.value.length > 5;
        });
        submit_button.addEventListener('click', () => {
            trigger('submit');
        });
        clear_button.addEventListener('click', () => {
            props.value = "";
            props.valid = false;
            trigger('clear');
        });
    """,
    valid=False)
    output_box = gr.Textbox()
    form.submit(lambda x: x, form, outputs=output_box)
    

if __name__ == "__main__":
    demo.launch()
