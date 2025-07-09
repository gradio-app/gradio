#!/usr/bin/env python3
"""
Test file for CLI command with enhanced playground examples.
"""

# GRADIO MOCKUP START
# [textbox] "Enter text to classify"
# [dropdown] "Language" choices=["English", "Spanish", "French"]
# [radio] "Gender" choices=["Male", "Female", "Other"]
# [checkboxgroup] "Features" choices=["feature1", "feature2", "feature3"]
# [button] "Classify"
# [annotatedimage] "Object Detection Results"
# GRADIO MOCKUP END

import gradio as gr

def classify_text(text, language, gender, features):
    return f"Classified '{text}' in {language} for {gender} with features {features}"

# Create the interface
demo = gr.Interface(
    fn=classify_text,
    inputs=[
        gr.Textbox(label="Enter text to classify"),
        gr.Dropdown(choices=["English", "Spanish", "French"], label="Language"),
        gr.Radio(choices=["Male", "Female", "Other"], label="Gender"),
        gr.CheckboxGroup(choices=["feature1", "feature2", "feature3"], label="Features")
    ],
    outputs="text",
    title="Text Classification with Enhanced Features"
)

if __name__ == "__main__":
    demo.launch()
