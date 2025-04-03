import os
import subprocess

import gradio_client
import pytest
import requests

file_dir = os.path.dirname(os.path.abspath(__file__))
gradio_dir = os.path.dirname(os.path.dirname(file_dir))

subprocess.run(
    ["python", "-m", "build", "--wheel", gradio_dir, "--outdir", file_dir], check=True
)
subprocess.run(
    [
        "python",
        "-m",
        "build",
        "--wheel",
        os.path.join(gradio_dir, "client/python/"),
        "--outdir",
        file_dir,
    ],
    check=True,
)


@pytest.fixture(scope="session")
def docker_compose_file(pytestconfig):
    return os.path.join(os.path.dirname(__file__), "docker-compose.yml")


@pytest.fixture(scope="session")
def docker_compose_project_name():
    import uuid

    return f"gradio_nginx_test_{uuid.uuid4().hex[:8]}"


def is_responsive(url):
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return True
        else:
            print(f"Unexpected status code: {response.status_code}")
    except requests.exceptions.ConnectionError as e:
        print(f"Connection error: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"Timeout error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {type(e).__name__}: {e}")
        return False
    return False


@pytest.fixture(scope="session")
def endpoint(docker_ip, docker_services):
    port = docker_services.port_for("nginx", 80)
    base_url = f"http://{docker_ip}:{port}"
    url = f"{base_url}/config"

    docker_services.wait_until_responsive(
        timeout=30.0, pause=1.0, check=lambda: is_responsive(url)
    )
    return base_url


def test_endpoint_status(endpoint):
    response = requests.get(endpoint)
    assert response.status_code == 200
    response = requests.get(f"{endpoint}/config")
    assert response.status_code == 200
    config = response.json()
    assert config["root"] == "http://127.0.0.1"
    response = requests.get(f"{endpoint}/theme.css")
    assert response.status_code == 200
    response = requests.get(f"{endpoint}/fail")
    assert response.status_code == 404


def test_api_response(endpoint):
    """Test that gradio API endpoint returns a valid value."""
    client = gradio_client.Client(endpoint)
    result = client.predict("John")
    assert result == "Hi John"
