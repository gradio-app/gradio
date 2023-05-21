import os
import tempfile

import pytest
from gradio import components

from gradio_client.serializing import COMPONENT_MAPPING, FileSerializable, Serializable
from gradio_client.utils import encode_url_or_file_to_base64


@pytest.mark.parametrize("serializer_class", Serializable.__subclasses__())
def test_duplicate(serializer_class):
    if "gradio_client" not in serializer_class.__module__:
        pytest.skip(f"{serializer_class} not defined in gradio_client")
    serializer = serializer_class()
    info = serializer.api_info()
    assert "info" in info and "serialized_info" in info
    if "serialized_info" in info:
        assert serializer.serialized_info()


def test_check_component_fallback_serializers():
    for component_name, class_type in COMPONENT_MAPPING.items():
        # skip components that cannot be instantiated without parameters
        if component_name in ["dataset", "interpretation"]:
            continue
        component = components.get_component_instance(component_name)
        assert isinstance(component, class_type)


def test_all_components_in_component_mapping(all_components):
    for component in all_components:
        assert component.__name__.lower() in COMPONENT_MAPPING


def test_file_serializing():
    try:
        serializing = FileSerializable()
        with tempfile.NamedTemporaryFile(delete=False, mode="w") as f1:
            with tempfile.NamedTemporaryFile(delete=False, mode="w") as f2:
                f1.write("Hello World!")
                f2.write("Greetings!")

        output = serializing.serialize(f1.name)
        assert output["data"] == encode_url_or_file_to_base64(f1.name)
        output = serializing.serialize([f1.name, f2.name])
        assert output[0]["data"] == encode_url_or_file_to_base64(f1.name)
        assert output[1]["data"] == encode_url_or_file_to_base64(f2.name)

        # no-op for dict
        assert serializing.serialize(output) == output

        files = serializing.deserialize(output)
        with open(files[0]) as f:
            assert f.read() == "Hello World!"
        with open(files[1]) as f:
            assert f.read() == "Greetings!"
    finally:
        os.remove(f1.name)
        os.remove(f2.name)
