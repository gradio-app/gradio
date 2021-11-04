import os
import json
from jinja2 import Template

def generate():
    os.makedirs("generated", exist_ok=True)
    with open("src/tweets.json") as tweets_file:
        tweets = json.load(tweets_file)
    with open("src/index_template.html") as template_file:
        template = Template(template_file.read())
        output_html = template.render(tweets=tweets)
    with open(os.path.join("generated", "index.html"), "w") as generated_template:
        generated_template.write(output_html)

if __name__ == "__main__":
    generate()
