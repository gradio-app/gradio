import os

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../"
TEMPLATE_FILE = os.path.join(DIR, "template.html")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

demo_list = ["hello_world", "hello_world_2", "hello_world_3", "sepia_filter", "sales_projections",
         "calculator", "calculator_live", "blocks_hello", "blocks_flipper", "blocks_gpt", "blocks_speech_text_sentiment",
         "blocks_essay"]
demos = []
for demo in demo_list:
    demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
    with open(demo_file) as run_py:
        demo_code = run_py.read()
    demos.append((demo, demo_code))


def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("recipes/template.html")
    output = template.render(demos=demos)
    output_folder = os.path.join(output_dir, "recipes")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)
