import gradio as gr
import shap
from transformers import pipeline
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use('Agg')


sentiment_classifier = pipeline("text-classification", return_all_scores=True)


def classifier(text):
    pred = sentiment_classifier(text)
    return {p["label"]: p["score"] for p in pred[0]}


def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))

    scores_desc = sorted(scores, key=lambda t: t[1])[::-1]

    # Filter out empty string added by shap
    scores_desc = [t for t in scores_desc if t[0] != ""]

    fig_m = plt.figure()
    plt.bar(x=[s[0] for s in scores_desc[:5]],
            height=[s[1] for s in scores_desc[:5]])
    plt.title("Top words contributing to positive sentiment")
    plt.ylabel("Shap Value")
    plt.xlabel("Word")
    return {"original": text, "interpretation": scores}, fig_m


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
                interpret = gr.Button("Interpret")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")
        with gr.Column():
            with gr.Tabs():
                with gr.TabItem("Display interpretation with built-in component"):
                    interpretation = gr.components.Interpretation(input_text)
                with gr.TabItem("Display interpretation with plot"):
                    interpretation_plot = gr.Plot()

    classify.click(classifier, input_text, label)
    interpret.click(interpretation_function, input_text, [interpretation, interpretation_plot])

demo.launch()