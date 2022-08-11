import os

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../"
TEMPLATE_FILE = os.path.join(DIR, "template.html")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

demos = [
    {"name": "Hello World", "dir": "hello_world", "code": None},
    {"name": "Sepia Filter", "dir": "sepia_filter", "code": None},
    {"name": "Sales Projections", "dir": "sales_projections", "code": None},
    {"name": "Calculator", "dir": "calculator", "code": None},
    {"name": "Calculator Live", "dir": "calculator_live", "code": None},
    {"name": "Hello World (Blocks)", "dir": "blocks_hello", "code": None},
    {"name": "Image and Text Flipper", "dir": "blocks_flipper", "code": None},
    {"name": "GPT", "dir": "blocks_gpt", "code": None},
    {"name": "Sentiment Analysis", "dir": "blocks_speech_text_sentiment", "code": None},
    {"name": "Image Classification with Keras", "dir": "image_classifier", "code": None},
    {"name": "Image Classification with Pytorch", "dir": "image_classifier_2", "code": None},
    {"name": "Titanic Survival", "dir": "titanic_survival", "code": None},
    {"name": "Outbreak Forecast", "dir": "outbreak_forecast", "code": None},
    {"name": "GPT-J", "dir": "gpt_j", "code": None},
]

for demo in demos:
    demo_file = os.path.join(DEMOS_DIR, demo["dir"], "run.py")
    with open(demo_file) as run_py:
        demo_code = run_py.read()
    demo["code"] = demo_code


def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("recipes/template.html")
    output = template.render(demos=demos)
    output_folder = os.path.join(output_dir, "recipes")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)
