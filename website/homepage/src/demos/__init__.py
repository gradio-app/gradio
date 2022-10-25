import os
import json

GRADIO_DEMO_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "demo"))
DIR = os.path.dirname(__file__)
TEMPLATE_FILE = os.path.join(DIR, "template.html")

def get_code_and_description(demo_name):
    with open(os.path.join(GRADIO_DEMO_DIR, demo_name, "run.py")) as f:
        code = f.read()
    with open(os.path.join(GRADIO_DEMO_DIR, demo_name, "DESCRIPTION.md")) as f:
        description = f.read()
    return code, description


demos_by_category = [
    {
        "category": "🖊️ Text & Natural Language Processing",
        "demos": [
            {
                "name": "Hello World", 
                "dir": "hello_world", 
            },
            {
                "name": "Text Generation", 
                "dir": "text_generation", 
            },
            {
                "name": "Autocomplete", 
                "dir": "autocomplete", 
            },
            {
                "name": "Sentiment Analysis", 
                "dir": "sentiment_analysis", 
            },
            {
                "name": "Named Entity Recognition", 
                "dir": "text_analysis", 
            },
            {
                "name": "Multilingual Translation", 
                "dir": "translation", 
            }

        ]
    },
     {
        "category": "🖼️ Images & Computer Vision",
        "demos": [
            {
                "name": "Image Classification", 
                "dir": "image_classification", 
            },
            {
                "name": "Image Segmentation", 
                "dir": "image_segmentation", 
            },
            {
                "name": "Image Transformation with AnimeGAN", 
                "dir": "animeganv2", 
            },
            {
                "name": "Image Generation with Stable Diffusion", 
                "dir": "stable-diffusion", 
                "external_space": "stabilityai/stable-diffusion"
            },
            {
                "name": "Iterative Output",
                "dir": "fake_diffusion",
            },
            {
                "name": "3D Models", 
                "dir": "depth_estimation", 
            },
        ]
    },
    {
        "category": "📈 Tabular Data & Plots",
        "demos": [
            {
                "name": "Interactive Dashboard",
                "dir": "dashboard"
            },
            {
                "name": "Outbreak Forecast", 
                "dir": "outbreak_forecast", 
            },
            {
                "name": "Clustering with Scikit-Learn", 
                "dir": "clustering", 
            },
            {
                "name": "Time Series Forecasting", 
                "dir": "timeseries-forecasting-with-prophet", 
            },
            {
                "name": "Income Classification with XGBoost", 
                "dir": "xgboost-income-prediction-with-explainability", 
            },
            {
                "name": "Leaderboard", 
                "dir": "leaderboard", 
            },
            {
                "name": "Tax Calculator", 
                "dir": "tax_calculator", 
            },
        ]
    },
    {
        "category": "🎤 Audio & Speech",
        "demos": [
            {
                "name": "Text to Speech", 
                "dir": "neon-tts-plugin-coqui", 
            },
            {
                "name": "Speech to Text (ASR)", 
                "dir": "automatic-speech-recognition", 
            },
            {
                "name": "Musical Instrument Identification", 
                "dir": "musical_instrument_identification", 
            },
            {
                "name": "Speaker Verification", 
                "dir": "same-person-or-different", 
            },
        ]
    },
]

for category in demos_by_category:
    for demo in category["demos"]:
        code, description = get_code_and_description(demo["dir"])
        demo["code"] = code
        demo["text"] = description

def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("demos/template.html")
    output = template.render(demos_by_category=demos_by_category)
    output_folder = os.path.join(output_dir, "demos")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)
