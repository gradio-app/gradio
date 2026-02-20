import gradio as gr

with gr.Blocks() as demo:
    with gr.HTML(html_template='''
        <button class="maximize">&#x26F6;</button>
        <h2>${form_name}</h2>
        @children
        <button class="submit">Submit</button>
    ''', css_template='''
        border: 2px solid gray;
        border-radius: 12px;
        padding: 20px;

        .maximize {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            z-index: 1000;
        }
    ''', js_on_load='''
        element.querySelector('.submit').addEventListener('click', () => {
            trigger('submit');
        });
        element.querySelector('.maximize').addEventListener('click', () => {
            element.requestFullscreen();
        });
    ''', form_name="Custom Form") as form:
        name = gr.Textbox(label="Name")
        email = gr.Textbox(label="Email")

    output = gr.Textbox(label="Output")
    
    form.submit(lambda name, email: f"Name: {name}, Email: {email}", inputs=[name, email], outputs=output)

demo.launch()