import sys
import os
import markdown2
from jinja2 import Template
import re

GRADIO_DIR = "../../"
GRADIO_GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")


def run():
    guides = []
    for guide in os.listdir(GRADIO_GUIDES_DIR):
        if "template" in guide:
            continue
        with open(os.path.join(GRADIO_GUIDES_DIR, guide)) as guide_file:
            guide_text = guide_file.read()
        code_tags = re.findall(r'\{\{ code\["([^\s]*)"\] \}\}', guide_text)
        demo_tags = re.findall(r'\{\{ demos\["([^\s]*)"\] \}\}', guide_text)
        code, demos = {}, {}
        guide_text = guide_text.replace(
            "website/src/assets", "/assets").replace(
            "```python\n", "<pre><code class='lang-python'>").replace(
            "```bash\n", "<pre><code class='lang-bash'>").replace(
            "```directory\n", "<pre><code class='lang-bash'>").replace(
            "```csv\n", "<pre><code class='lang-bash'>").replace(
            "```", "</code></pre>")
        for code_src in code_tags:
            with open(os.path.join(GRADIO_DEMO_DIR, code_src + ".py")) as code_file:
                python_code = code_file.read().replace(
                    'if __name__ == "__main__":\n    iface.launch()', "iface.launch()")
                code[code_src] = "<pre><code class='lang-python'>" + \
                    python_code + "</code></pre>"
        for i, demo_src in enumerate(demo_tags):
            demos[demo_src] = "<div id='interface_" + str(i) + "'></div>"
        guide_template = Template(guide_text)
        guide_output = guide_template.render(code=code, demos=demos)
        output_html = markdown2.markdown(guide_output)
        output_html = output_html.replace("<a ", "<a target='blank' ")
        for match in re.findall(r'<h3>([A-Za-z0-9 ]*)<\/h3>', output_html):
            output_html = output_html.replace(
                f"<h3>{match}</h3>", f"<h3 id={match.lower().replace(' ', '_')}>{match}</h3>")
        os.makedirs("generated", exist_ok=True)
        guide = guide[:-3] # remove .md
        os.makedirs(os.path.join(
            "generated", guide), exist_ok=True)
        with open("src/guides_template.html") as general_template_file:
            general_template = Template(general_template_file.read())
        with open(os.path.join("generated", guide, "index.html"), "w") as generated_template:
            output_html = general_template.render(template_html=output_html)
            generated_template.write(output_html)

if __name__ == "__main__":
    run()
