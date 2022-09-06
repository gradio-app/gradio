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
                "text": "The simplest possible Gradio demo. It wraps a 'Hello {name}!' function in an Interface that accepts and returns text."
            },
            {
                "name": "Translation", 
                "dir": "translation", 
                "code": get_code("translation"),
                "text": "This translation demo takes in the text, source and target languages, and returns the translation. It uses the Transformers library to set up the model and has a title, description, and example."
            },
            {
                "name": "Text Generation", 
                "dir": "text_generation", 
                "code": get_code("text_generation"),
                "text": "This text generation demo takes in input text and returns generated text. It uses the Transformers library to set up the model and has two examples."
            },
            {
                "name": "Autocomplete", 
                "dir": "autocomplete", 
                "code": get_code("autocomplete"),
                "text": "This text generation demo works like autocomplete. There's only one textbox and it's used for both the input and the output. The demo loads the model as an interface, and uses that interface as an API. It then uses blocks to create the UI. All of this is done in less than 10 lines of code."
            },
            {
                "name": "Sentiment Analysis", 
                "dir": "sentiment_analysis", 
                "code": get_code("sentiment_analysis"),
                "text": "This sentiment analaysis demo takes in input text and returns its classification for either positive, negative or neutral using Gradio's Label output. It also uses the default interpretation method so users can click the Interpret button after a submission and see which words had the biggest effect on the output."
            },
            {
                "name": "Named Entity Recognition", 
                "dir": "text_analysis", 
                "code": get_code("text_analysis"),
                "text": "This simple demo takes advantage of Gradio's HighlightedText, JSON and HTML outputs to create a clear NER segmentation."
            },

        ]
    },
     {
        "category": "🖼️ Images & Computer Vision",
        "demos": [
            {
                "name": "Image Classification", 
                "dir": "image_classifier", 
                "code": get_code("image_classifier"),
                "text": ""
            },
            {
                "name": "Image Segmentation", 
                "dir": "image_segmentation", 
                "code": get_code("image_segmentation"),
                "text": ""
            },
            {
                "name": "Image to Image Transformation", 
                "dir": "animeganv2", 
                "code": get_code("animeganv2"),
                "text": ""
            },
            {
                "name": "Text to Image Generation", 
                "dir": "stable_diffusion", 
                "code": get_code("stable_diffusion"),
                "text": ""
            },
            {
                "name": "3D Models", 
                "dir": "depth_estimation", 
                "code": get_code("depth_estimation"),
                "text": ""
            },
        ]
    },
    {
        "category": "📈 Tabular Data & Plots",
        "demos": [
            {
                "name": "Clustering with Scikit-Learn", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Time Series Forecasting", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Income Classification with XGBoost", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Leaderboard", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Tax Calculator", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
        ]
    },
    {
        "category": "🎤 Audio & Speech",
        "demos": [
            {
                "name": "Text to Speech", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Speech to Text (ASR)", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Musical Instrument Identification", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Speaker Verification", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
        ]
    },
    {
        "category": "✨ Fun",
        "demos": [
            {
                "name": "Musika!", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "First Order Motion Model", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Titanic Survival", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
            {
                "name": "Draw to Search", 
                "dir": "hello_world", 
                "code": get_code("hello_world"),
                "text": ""
            },
        ]
    }
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
