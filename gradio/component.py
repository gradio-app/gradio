class Component():
    """
    A class for defining the methods that all gradio input and output components should have.
    """

    def __init__(self, label):
        self.label = label

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {"label": self.label}

    def preprocess(self, x):
        """
        Any preprocessing needed to be performed on function input.
        """
        return x

    def postprocess(self, y):
        """
        Any postprocessing needed to be performed on function output.
        """
        return y

    def process_example(self, example):
        """
        Proprocess example for UI
        """
        return example

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}
