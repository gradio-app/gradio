import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

import gradio as gr

nltk.download("vader_lexicon")
sid = SentimentIntensityAnalyzer()


def sentiment_analysis(text):
    scores = sid.polarity_scores(text)
    del scores["compound"]
    return scores


demo = gr.Interface(
    sentiment_analysis, 
    gr.Textbox(placeholder="Enter a positive or negative sentence here..."), 
    "label", 
    interpretation="default")

if __name__ == "__main__":
    demo.launch()
