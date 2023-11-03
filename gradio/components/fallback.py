from gradio.components.base import Component


class Fallback(Component):
    def preprocess(self, payload):
        return payload

    def postprocess(self, value):
        return value

    def example_inputs(self):
        return {"foo": "bar"}

    def api_info(self):
        return {"type": {}, "description": "any valid json"}
