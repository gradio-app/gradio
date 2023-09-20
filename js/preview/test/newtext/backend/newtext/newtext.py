import gradio as gr

class NewText(gr.components.Component):
    
    def preprocess(self, x):
        return x
    
    def postprocess(self, x):
        return x
    
    def get_config(self):
        return {
            "value": self.value,
            **gr.components.Component.get_config(self),
        }

    def example_inputs(self):
        return {'foo': 'bar'}

    def api_info(self):
        return {'type': {}, 'description': 'any valid json'}