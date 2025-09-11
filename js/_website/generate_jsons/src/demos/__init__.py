import json
from pathlib import Path


HERE = Path(__file__).parent
WEBSITE_DIR = HERE.joinpath("../../..").resolve()
PROJECT_ROOT = WEBSITE_DIR.joinpath("../..").resolve()
GRADIO_DEMO_DIR = PROJECT_ROOT / "demo"


def get_code_description_and_reqs(demo_dir):
    with demo_dir.joinpath("run.py").open() as f:
        code = f.read()

    description = ""
    description_path = demo_dir.joinpath("DESCRIPTION.md")
    if description_path.exists():
        with description_path.open() as f:
            description = f.read()

    requirements = []
    requirements_path = demo_dir.joinpath("requirements.txt")
    if requirements_path.exists():
        with requirements_path.open() as f:
            requirements = [line.strip() for line in f.read().strip().split("\n")]

    return code, description, requirements


demos_by_category = [
    {
        "category": "Text",
        "demos": [
            {
                "name": "Hello World",
                "dir": "hello_world",
            },
            {
                "name": "Hello Blocks",
                "dir": "hello_blocks",
            },
            {
                "name": "Sentence Builder",
                "dir": "sentence_builder",
            },
            {
                "name": "Diff Texts",
                "dir": "diff_texts",
            },
        ],
    },
    {
        "category": "Media",
        "demos": [
            {
                "name": "Sepia Filter",
                "dir": "sepia_filter",
            },
            {
                "name": "Video Identity",
                "dir": "video_identity_2",
            },
            {
                "name": "Iterative Output",
                "dir": "fake_diffusion",
            },
            {
                "name": "Generate Tone",
                "dir": "generate_tone",
            },
        ],
    },
    {
        "category": "Tabular",
        "demos": [
            {"name": "Filter Records", "dir": "filter_records"},
            {"name": "Transpose Matrix", "dir": "matrix_transpose"},
            {"name": "Tax Calculator", "dir": "tax_calculator"},
            {
                "name": "Kinematics",
                "dir": "blocks_kinematics",
            },
            {
                "name": "Stock Forecast",
                "dir": "stock_forecast",
            },
        ],
    },
    {
        "category": "Chatbots",
        "demos": [
            {
                "name": "Chatbot",
                "dir": "chatinterface_random_response",
            },
            {
                "name": "Streaming Chatbot",
                "dir": "chatinterface_streaming_echo",
            },
            {
                "name": "Chatbot with Tools",
                "dir": "chatbot_with_tools",
            },
            {
                "name": "Chatinterface with Code",
                "dir": "chatinterface_artifacts",
            },
        ],
    },
    {
        "category": "Other",
        "demos": [
            {
                "name": "Tabbed Interface",
                "dir": "tabbed_interface_lite",
            },
            {
                "name": "Layouts",
                "dir": "blocks_flipper",
            },
            {
                "name": "Error",
                "dir": "calculator",
            },
            {
                "name": "Chained Events",
                "dir": "blocks_chained_events",
            },
            {
                "name": "Change Listener",
                "dir": "blocks_hello",
            },
        ],
    },
]


for category in demos_by_category:
    for demo in category["demos"]:
        base_dir = GRADIO_DEMO_DIR
        demo_dir = base_dir / demo["dir"]

        code, description, requirements = get_code_description_and_reqs(demo_dir)
        demo["code"] = code.replace("# type: ignore", "")
        demo["text"] = description
        demo["requirements"] = requirements


def generate(json_path):
    with open(json_path, "w+") as f:
        json.dump(demos_by_category, f)


if __name__ == "__main__":
    dest_path = WEBSITE_DIR / "src/lib/json/demos.json"
    print(f"Generating {dest_path}")
    generate(dest_path)
