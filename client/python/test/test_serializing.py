import tempfile

from gradio import components

from gradio_client.serializing import COMPONENT_MAPPING, FileSerializable
from gradio_client.utils import encode_url_or_file_to_base64


def test_check_component_fallback_serializers():
    for component_name, class_type in COMPONENT_MAPPING.items():
        if component_name == "dataset":  # cannot be instantiated without parameters
            continue
        component = components.get_component_instance(component_name)
        assert isinstance(component, class_type)


def test_file_serializing():

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
