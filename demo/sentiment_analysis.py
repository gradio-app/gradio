import gradio as gr
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
nltk.download('vader_lexicon')
sid = SentimentIntensityAnalyzer()

def sentiment_analysis(text):
    scores = sid.polarity_scores(text)
    del scores["compound"]
    return scores

io = gr.Interface(sentiment_analysis, "textbox", "label", explain_by="default")

io.test_launch()
io.launch()