# Demo: (Textbox) -> (Label)

import gradio as gr
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
nltk.download('vader_lexicon')
sid = SentimentIntensityAnalyzer()

def sentiment_analysis(text):
    scores = sid.polarity_scores(text)
    del scores["compound"]
    return scores

iface = gr.Interface(sentiment_analysis, "textbox", "label", interpretation="default")

iface.test_launch()
if __name__ == "__main__":
    iface.launch()
