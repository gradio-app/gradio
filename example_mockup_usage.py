"""
Example usage script for the Gradio mockup generator.

This script demonstrates how to use the mockup generator both programmatically
and via the CLI command.
"""

import gradio as gr

# GRADIO MOCKUP START
[textbox] "Name"
[row]
  [textbox:3] "Bio"
  [column]
    [slider] "Age" min=0 max=100
    [checkbox] "Agree to terms"
[button] "Submit"
# GRADIO MOCKUP END

# This is the actual Gradio implementation
def process_form(name, bio, age, agree):
    if not agree:
        return "You must agree to the terms to continue."
    
    return f"Hello {name}! Your bio: {bio}. Age: {age}"

# Create the actual Gradio interface
interface = gr.Interface(
    fn=process_form,
    inputs=[
        gr.Textbox(label="Name"),
        gr.Textbox(label="Bio", lines=3),
        gr.Slider(label="Age", minimum=0, maximum=100),
        gr.Checkbox(label="Agree to terms")
    ],
    outputs="text",
    title="Example Form"
)

if __name__ == "__main__":
    interface.launch()
