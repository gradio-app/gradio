import requests


def get_latest_stable():
    return requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"]
