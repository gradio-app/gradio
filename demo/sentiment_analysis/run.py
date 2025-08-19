import gradio as gr
import nltk  # type: ignore
from nltk.sentiment.vader import SentimentIntensityAnalyzer  # type: ignore

nltk.download("vader_lexicon")
sid = SentimentIntensityAnalyzer()

def sentiment_analysis(text):
    scores = sid.polarity_scores(text)
    del scores["compound"]
    return scores

demo = gr.Interface(
    fn=sentiment_analysis,
    inputs=gr.Textbox(placeholder="Enter a positive or negative sentence here..."),
    outputs="label",
    examples=[["This is wonderful!"]])

demo.launch()
