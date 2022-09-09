import os

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../"
TEMPLATE_FILE = os.path.join(DIR, "template.html")
RECIPE_DEMOS_DIR = os.path.join(DIR, "recipe_demos")


def get_code(demo_name):
    with open(os.path.join(RECIPE_DEMOS_DIR, demo_name, "app.py")) as f:
        code = f.read()
        code = "\n".join(code.split("\n")[1:])
    return code


demos_by_category = [
    {
        "category": "🖊️ Text & Natural Language Processing",
        "demos": [
            {
                "name": "Hello World", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "external_space": None,
                "text": "The simplest possible Gradio demo. It wraps a 'Hello {name}!' function in an Interface that accepts and returns text."
            },
            {
                "name": "Text Generation", 
                "dir": "text_generation", 
                "code": get_code("text_generation"),
                "external_space": None,
                "text": "This text generation demo takes in input text and returns generated text. It uses the Transformers library to set up the model and has two examples."
            },
            {
                "name": "Autocomplete", 
                "dir": "autocomplete", 
                "code": get_code("autocomplete"),
                "external_space": None,
                "text": "This text generation demo works like autocomplete. There's only one textbox and it's used for both the input and the output. The demo loads the model as an interface, and uses that interface as an API. It then uses blocks to create the UI. All of this is done in less than 10 lines of code."
            },
            {
                "name": "Sentiment Analysis", 
                "dir": "sentiment_analysis", 
                "code": get_code("sentiment_analysis"),
                "external_space": None,
                "text": "This sentiment analaysis demo takes in input text and returns its classification for either positive, negative or neutral using Gradio's Label output. It also uses the default interpretation method so users can click the Interpret button after a submission and see which words had the biggest effect on the output."
            },
            {
                "name": "Named Entity Recognition", 
                "dir": "text_analysis", 
                "code": get_code("text_analysis"),
                "external_space": None,
                "text": "This simple demo takes advantage of Gradio's HighlightedText, JSON and HTML outputs to create a clear NER segmentation."
            },
            {
                "name": "Multilingual Translation", 
                "dir": "translation", 
                "code": get_code("translation"),
                "external_space": None,
                "text": "This translation demo takes in the text, source and target languages, and returns the translation. It uses the Transformers library to set up the model and has a title, description, and example."
            }

        ]
    },
     {
        "category": "🖼️ Images & Computer Vision",
        "demos": [
            {
                "name": "Image Classification", 
                "dir": "image_classifier", 
                "code": get_code("image_classifier"),
                "external_space": None,
                "text": "Simple image classification in Pytorch with Gradio's Image input and Label output."
            },
            {
                "name": "Image Segmentation", 
                "dir": "image_segmentation", 
                "code": get_code("image_segmentation"),
                "external_space": None,
                "text": "Image segmentation using DETR. Takes in both an inputu image and the desired confidence, and returns a segmented image."
            },
            {
                "name": "Image Transformation with AnimeGAN", 
                "dir": "animeganv2", 
                "code": get_code("animeganv2"),
                "external_space": None,
                "text": "Recreate the viral AnimeGAN image transformation demo."
            },
            {
                "name": "Image Generation with Stable Diffusion", 
                "dir": "stable-diffusion", 
                "code": get_code("stable-diffusion"),
                "external_space": "stabilityai/stable-diffusion",
                "text": "Note: This is a simplified version of the code needed to create the Stable Diffusion demo. See full code here: https://hf.co/spaces/stabilityai/stable-diffusion/tree/main"
            },
            {
                "name": "3D Models", 
                "dir": "depth_estimation", 
                "external_space": None,
                "code": get_code("depth_estimation"),
                "text": "A demo for predicting the depth of an image and generating a 3D model of it."
            },
        ]
    },
    {
        "category": "📈 Tabular Data & Plots",
        "demos": [
            {
                "name": "Clustering with Scikit-Learn", 
                "dir": "clustering", 
                "code": get_code("clustering"),
                "external_space": None,
                "text": "This demo built with Blocks generates 9 plots based on the input."
            },
            {
                "name": "Time Series Forecasting", 
                "dir": "timeseries-forecasting-with-prophet", 
                "code": get_code("timeseries-forecasting-with-prophet"),
                "external_space": None,
                "text": "A simple dashboard showing pypi stats for python libraries. Updates on load, and has no buttons!"
            },
            {
                "name": "Income Classification with XGBoost", 
                "dir": "xgboost-income-prediction-with-explainability", 
                "code": get_code("xgboost-income-prediction-with-explainability"),
                "external_space": None,
                "text": "This demo takes in 12 inputs from the user in dropdowns and sliders and predicts income. It also has a separate button for explaining the prediction."
            },
            {
                "name": "Leaderboard", 
                "dir": "leaderboard", 
                "code": get_code("leaderboard"),
                "external_space": None,
                "text": "A simple dashboard ranking spaces by number of likes."
            },
            {
                "name": "Tax Calculator", 
                "dir": "tax_calculator", 
                "code": get_code("tax_calculator"),
                "external_space": None,
                "text": "Calculate taxes using Textbox, Radio, and Dataframe components"
            },
        ]
    },
    {
        "category": "🎤 Audio & Speech",
        "demos": [
            {
                "name": "Text to Speech", 
                "dir": "neon-tts-plugin-coqui", 
                "code": get_code("neon-tts-plugin-coqui"),
                "external_space": None,
                "text": "This Blocks demo converts text to speech in 14 languages."
            },
            {
                "name": "Speech to Text (ASR)", 
                "dir": "automatic-speech-recognition", 
                "code": get_code("automatic-speech-recognition"),
                "external_space": None,
                "text": "Automatic speech recognition in Chinese and English. Uses a tabbed layout to give the user the choice between uploading audio or recording from a microphone."
            },
            {
                "name": "Musical Instrument Identification", 
                "dir": "musical_instrument_identification", 
                "code": get_code("musical_instrument_identification"),
                "external_space": None,
                "text": "This demo identifies musical instruments from an audio file. It uses Gradio's Audio and Label components."
            },
            {
                "name": "Speaker Verification", 
                "dir": "same-person-or-different", 
                "code": get_code("same-person-or-different"),
                "external_space": None,
                "text": "This demo identifies if two speakers are the same person using Gradio's Audio and HTML components."
            },
        ]
    },
]


def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("recipes/template.html")
    output = template.render(demos_by_category=demos_by_category)
    output_folder = os.path.join(output_dir, "recipes")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)
