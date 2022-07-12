import os
import json
import requests

DIR = os.path.dirname(__file__)
TEMPLATE_FILE = os.path.join(DIR, "template.html")
TWEETS_FILE = os.path.join(DIR, "tweets.json")
with open(TWEETS_FILE) as tweets_json:
    tweets = json.load(tweets_json)


def build(output_dir, jinja_env):
    OUTPUT_FILE = os.path.join(output_dir, "index.html")
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("index/template.html")
    star_request = requests.get("https://api.github.com/repos/gradio-app/gradio").json()
    star_count = (
        "{:,}".format(star_request["stargazers_count"])
        if "stargazers_count" in star_request
        else ""
    )
    output = template.render(tweets=tweets, star_count=star_count)
    with open(OUTPUT_FILE, "w") as index_html:
        index_html.write(output)
