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
            }
        ]
    },
     {
        "category": "🖼️ Images & Computer Vision",
        "demos": [
            # {"name": "Sepia Filter", "dir": "sepia_filter", "code": None},
            # {"name": "Image and Text Flipper", "dir": "blocks_flipper", "code": None},
            # {"name": "Image Classification with Keras", "dir": "image_classifier", "code": None},
            # {"name": "Image Classification with Pytorch", "dir": "image_classifier_2", "code": None},
        ]
    },
    {
        "category": "📈 Tabular Data & Plots",
        "demos": [
            # {"name": "Sales Projections", "dir": "sales_projections", "code": None},
            # {"name": "Calculator", "dir": "calculator", "code": None},
            # {"name": "Calculator Live", "dir": "calculator_live", "code": None},
            # {"name": "Titanic Survival", "dir": "titanic_survival", "code": None},
            # {"name": "Outbreak Forecast", "dir": "outbreak_forecast", "code": None},
        ]
    },
    {
        "category": "🎤 Audio & Speech",
        "demos": [
        ]
    },
    {
        "category": "✨ Fun",
        "demos": [
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
