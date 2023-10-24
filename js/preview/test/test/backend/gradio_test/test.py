from gradio.components.base import Component


class Test(Component):
    def preprocess(self, x):
        return x

    def postprocess(self, x):
        return x

    def example_inputs(self):
        return {"foo": "bar"}

    def api_info(self):
        return {"type": {}, "description": "any valid json"}
