import re
import os
from string import Template

with open("readme_template.md") as readme_file:
    readme = readme_file.read()

codes = re.findall(r'\$code_([^\s]*)', readme)
demos = re.findall(r'\$demo_([^\s]*)', readme)
template_dict = {}

for code_src in codes:
    with open(os.path.join("demo", code_src + ".py")) as code_file:
        python_code = code_file.read().replace('if __name__ == "__main__":\n    iface.launch()', "iface.launch()")
        template_dict["code_" + code_src] = "````python\n" + python_code + "\n````"

for demo_src in demos:
    template_dict["demo_" + demo_src] = "![" + demo_src + " interface](demo/screenshots/" + demo_src + "/1.gif)"

readme_template = Template(readme)
output_readme = readme_template.substitute(template_dict)

with open("README.md", "w") as readme_md:
    readme_md.write(output_readme)