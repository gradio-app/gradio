import gradio as gr


with gr.Blocks() as demo:
    gr.Markdown("""
    # Simple HTML usecase
    This is the classic `gr.HTML` usecase where we just want to render some static HTML.
    """)
    simple_html = gr.HTML("<h1 style='color:purple;' id='simple'>Hello, World!</h1>")

    gr.Markdown("""
    # Templated HTML usecase
    'value' can now be anything, and it can be used inside the `html_template` using `${value}` syntax.
    Note that when used as output or input, `value` is just this specific value rather than the entire HTML.
    """)
    with gr.Row():
        name1 = gr.Textbox(label="Name")
        templated_html = gr.HTML("", html_template="<h1>Hello, {{value}}! ${value.length} letters</h1>", elem_id="templated")
        name1.change(lambda x: x, inputs=name1, outputs=templated_html)

    gr.Markdown("""
    # Additional Props
    You are not limited to using `${value}` in the templates, you can add any number of custom tags to the template, and pass them to the component as keyword arguments. These props can be updated via python event listeners as well.
    """)
    with gr.Row():
        templated_html_props = gr.HTML("John", html_template="""
                            <h1 style="font-size: ${fontSize}px;">Hello, ${value}!</h1>
                """, fontSize=30, elem_id="props")
        slider = gr.Slider(10, 100, value=30, label="Font Size")
        slider.change(lambda x: gr.HTML(fontSize=x), inputs=slider, outputs=templated_html_props)

    gr.Markdown("""
    # CSS Templating
    We can also template CSS, which is automatically scoped to the component.
    """)
    with gr.Row():
        name2 = gr.Textbox(label="Person")
        color = gr.ColorPicker(label="Text Color", value="#00ff00")
        bold = gr.Checkbox(label="Bold Text", value=True)
        templated_html_css = gr.HTML(["J", "o", "h", "n"], html_template="""
                        <h1>Hello, ${value.join('')}!</h1>
                        <ul>
                          {{#each value}}
                            <li>{{this}}</li>
                          {{/each}}
                        </ul>
            """, css_template="""
            h1, li {
                color: ${color};
                font-weight: ${bold ? 'bold' : 'normal'};
            }
        """, color="green", bold=True, elem_id="css")
    with gr.Row():
        btn = gr.Button("Update HTML")
        btn_blue = gr.Button("Make HTML Blue")
    def update_templated_html_css(name, color, bold):
        return gr.HTML(value=list(name), color=color, bold=bold)
    btn.click(update_templated_html_css, inputs=[name2, color, bold], outputs=templated_html_css)
    btn_blue.click(lambda: gr.HTML(color="blue"), outputs=templated_html_css)

    gr.Markdown("""
    # JS Prop Updates
    We can now trigger events from gr.HTML using event listeners in `js_on_load`. This script has access to `element` which refers to the parent element, and `trigger(event_name)` or `trigger(event_name, event_data)`, which can be used to dispatch events.
    """)

    button_set = gr.HTML(
        html_template="""
        <button id='A'>A</button>
        <button id='B'>B</button>
        <button id='C'>C</button>
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
        elem_id="button_set"
    )
    clicked_box = gr.Textbox(label="Clicked")

    def on_button_click(evt: gr.EventData):
        return evt.clicked
    
    button_set.click(on_button_click, outputs=clicked_box)

    gr.Markdown("""
    # JS Prop Changes
    You can also update `value` or any other prop of the component from JS using `props`, e.g., `props.value = "new value"` will update the `value` prop and re-render the HTML template.
    """)    
    form = gr.HTML(
        html_template="""
        <input type="text" value="${value}" id="text-input" />
        <p>${value.length} letters</p>
        <button class="submit" style="display: ${valid ? 'block' : 'none'};">submit</button>
        <button class="clear">clear</button>
        """,
        js_on_load="""
        const input = element.querySelector('input');
        const submit_button = element.querySelector('button.submit');
        const clear_button = element.querySelector('button.clear');
        input.addEventListener('input', () => {
            props.valid = input.value.length > 5;
            props.value = input.value;
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
    valid=False, elem_id="form")
    output_box = gr.Textbox(label="Output Box")
    form.submit(lambda x: x, form, outputs=output_box)
    output_box.submit(lambda x: x, output_box, outputs=form)

    gr.Markdown("""
    # Extending gr.HTML for new Components
    You can create your own Components by extending the gr.HTML class.
    """)
    class ListComponent(gr.HTML):
        def __init__(self, container=True, label="List", **kwargs):
            super().__init__(
                html_template="""
                <h2>${label}</h2>
                <ul>
                    ${value.map(item => `<li>${item}</li>`).join('')}
                </ul>
                """,
                container=container,
                label=label,
                **kwargs
            )

    ListComponent(label="Fruits", value=["Apple", "Banana", "Cherry"], elem_id="fruits")
    ListComponent(label="Vegetables", value=["Carrot", "Broccoli", "Spinach"], elem_id="vegetables")



if __name__ == "__main__":
    demo.launch()
