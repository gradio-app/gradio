import gradio as gr

# GRADIO MOCKUP START
# [textbox] "Name"
# [row]
#   [textbox:3] "Bio"
#   [column]
#     [slider] "Age" min=0 max=100
#     [checkbox] "Agree to terms"
# [button] "Submit"
# GRADIO MOCKUP END

# Actual Gradio implementation would follow below
def process_form(name, bio, age, agree):
    return f"Hello {name}! Bio: {bio}, Age: {age}, Agreed: {agree}"

# Real Gradio app implementation
with gr.Blocks() as demo:
    with gr.Row():
        name = gr.Textbox(label="Name")
    
    with gr.Row():
        bio = gr.Textbox(label="Bio", lines=3)
        with gr.Column():
            age = gr.Slider(label="Age", minimum=0, maximum=100)
            agree = gr.Checkbox(label="Agree to terms")
    
    submit_btn = gr.Button("Submit")
    
    submit_btn.click(
        process_form,
        inputs=[name, bio, age, agree],
        outputs=gr.Textbox(label="Result")
    )

if __name__ == "__main__":
    demo.launch()
