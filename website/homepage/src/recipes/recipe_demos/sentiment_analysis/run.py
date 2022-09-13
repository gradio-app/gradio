# URL: https://huggingface.co/spaces/gradio/sentiment-analysis
# DESCRIPTION: This sentiment analaysis demo takes in input text and returns its classification for either positive, negative or neutral using Gradio's Label output. It also uses the default interpretation method so users can click the Interpret button after a submission and see which words had the biggest effect on the output.
# imports
import gradio as gr
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# load and set up model
nltk.download("vader_lexicon")
sid = SentimentIntensityAnalyzer()

# define core function 
def sentiment_analysis(text):
    scores = sid.polarity_scores(text)
    del scores["compound"]
    return scores

# define an interface with a textbox input, a label output, and interpretation
demo = gr.Interface(
    fn=sentiment_analysis, 
    inputs=gr.Textbox(placeholder="Enter a positive or negative sentence here..."), 
    outputs="label", 
    interpretation="default",
    examples=[["This is wonderful!"]])

# launch
demo.launch()