import gradio as gr
import shap
from transformers import pipeline


sentiment_classifier = pipeline("text-classification", return_all_scores=True)

def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))
    return {"original": text, "interpretation": scores}

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Sentiment Analysis", value="Wonderfully terrible")
            with gr.Row():
                interpret = gr.Button("Interpret")
        with gr.Column():
                interpretation = gr.components.Interpretation(input_text)

    interpret.click(interpretation_function, input_text, interpretation)

if __name__ == "__main__":
    demo.launch()