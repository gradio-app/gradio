import pytest
import os

@pytest.fixture(scope="session")
def docker_compose_file(pytestconfig):
    return os.path.join(os.path.dirname(__file__), "docker-compose.yml")


@pytest.fixture(scope="session")
def docker_compose_project_name():
    import uuid

    return f"gradio_nginx_test_{uuid.uuid4().hex[:8]}"
