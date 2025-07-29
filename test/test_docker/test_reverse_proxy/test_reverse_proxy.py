import os
import random
import re
import sys

import gradio_client
import pytest
import requests

TEST_NAME = "reverse_proxy"
folder = os.path.dirname(os.path.abspath(__file__))


pytestmark = pytest.mark.skipif(sys.platform == "win32", reason="Skipped on Windows")


@pytest.fixture(scope="module")
def launch_services(launch_services_fn):
    yield from launch_services_fn(TEST_NAME, folder)


@pytest.mark.serial
def test_endpoint_status(launch_services):
    for endpoint in launch_services:
        response = requests.get(endpoint)
        assert response.status_code == 200
        response = requests.get(f"{endpoint}/config")
        assert response.status_code == 200
        config = response.json()
        response = requests.get(f"{config['root']}/theme.css")
        assert response.status_code == 200
        response = requests.get(f"{endpoint}/fail")
        assert response.status_code == 404


@pytest.mark.serial
def test_api_response(launch_services):
    for endpoint in launch_services:
        client = gradio_client.Client(endpoint)
        result = client.predict("John")
        assert result == "Hi John"


@pytest.mark.serial
def test_load_assets(launch_services):
    for endpoint in launch_services:
        asset_regex = '"\\.\\/([A-Za-z0-9-_\\/.]+\\.(?:js|css))"'
        response = requests.get(endpoint)
        assert response.status_code == 200
        html = response.text
        main_assets = re.findall(asset_regex, html)
        js_asset_found = False
        css_asset_found = False
        for main_asset in main_assets:
            asset_url = f"{endpoint}/{main_asset}"
            asset_response = requests.get(asset_url)
            assert asset_response.status_code == 200
            assert len(asset_response.text) > 0
            if main_asset.endswith(".js"):
                js_asset_found = True
                first_line = asset_response.text.split(";")[0]
                sub_assets = re.findall(asset_regex, first_line)
                assert len(sub_assets) > 1
                random.shuffle(sub_assets)
                for sub_asset in sub_assets[:5]:
                    sub_asset_path = asset_url[: asset_url.rfind("/")]
                    sub_asset_url = f"{sub_asset_path}/{sub_asset}"
                    print("URL:", sub_asset_url)
                    sub_asset_response = requests.get(sub_asset_url)
                    assert sub_asset_response.status_code == 200
                    assert len(sub_asset_response.text) > 0
            elif main_asset.endswith(".css"):
                css_asset_found = True

        assert js_asset_found
        assert css_asset_found
