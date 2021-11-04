import sys, os
import markdown2
from string import Template
import re

GRADIO_DIR = os.pardir
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")

def generate():
    with open(os.path.join(GRADIO_DIR, "readme_template.md")) as readme_file:
        readme = readme_file.read()
    codes = re.findall(r'\$code_([^\s]*)', readme)
    demos = re.findall(r'\$demo_([^\s]*)', readme)
    readme = readme.replace("website/src/static2", "/static2")
    readme = readme.replace("```python\n", "<pre><code class='lang-python'>").replace("```bash\n", "<pre><code class='lang-bash'>").replace("```directory\n", "<pre><code class='lang-bash'>").replace("```csv\n", "<pre><code class='lang-bash'>").replace("```", "</code></pre>")
    template_dict = {}
    for code_src in codes:
        with open(os.path.join(GRADIO_DEMO_DIR, code_src + ".py")) as code_file:
            python_code = code_file.read().replace('if __name__ == "__main__":\n    iface.launch()', "iface.launch()")
            template_dict["code_" + code_src] = "<pre><code class='lang-python'>" + python_code + "</code></pre>"
    for i, demo_src in enumerate(demos):
        template_dict["demo_" + demo_src] = "<div id='interface_" + str(i) + "'></div>"
    readme_template = Template(readme)
    readme = readme_template.substitute(template_dict)
    readme_lines = readme.split("\n")
    getting_started_index = [i for i, line in enumerate(readme_lines) if line.startswith("## Getting Started")][0]
    gs_start_index = [i for i, line in enumerate(readme_lines) if line.startswith("### ") and i > getting_started_index][0]
    gs_end_index = [i for i, line in enumerate(readme_lines) if line.startswith("## ") and i > getting_started_index][0]
    af_start_index = [i for i, line in enumerate(readme_lines) if line.startswith("### ") and i > gs_end_index][0]
    af_end_index = [i for i, line in enumerate(readme_lines) if line.startswith("## ") and i > gs_end_index][0]
    os.makedirs("generated", exist_ok=True)
    with open("src/guides_template.html") as template_file:
        template = template_file.read()
    for start_index, end_index, generated_folder in [
            (gs_start_index, gs_end_index, "getting_started"), 
            (af_start_index, af_end_index, "advanced_features")]:
        output_lines = readme_lines[start_index: end_index]
        output_markdown = "\n".join(output_lines)
        output_html = markdown2.markdown(output_markdown)
        for match in re.findall(r'<h3>(.*)<\/h3>', output_html):
            output_html = output_html.replace(f"<h3>{match}</h3>", f"<h3 id={match.lower().replace(' ', '_')}>{match}</h3>")
        os.makedirs(os.path.join("generated", generated_folder), exist_ok=True)
        with open(os.path.join("generated", generated_folder, "index.html"), "w") as generated_template:
            output_html = template.replace("{{ template_html }}", output_html)
            generated_template.write(output_html)

if __name__ == "__main__":
    generate()
