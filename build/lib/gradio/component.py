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

    def rebuild(self, dir, data):
        """
        All interfaces should define a method that rebuilds the flagged input when it's passed back (i.e. rebuilds image from base64)
        """
        return data

    @classmethod
    def get_all_shortcut_implementations(cls):
        shortcuts = {}
        for sub_cls in cls.__subclasses__():
            for shortcut, parameters in sub_cls.get_shortcut_implementations().items():
                shortcuts[shortcut] = (sub_cls, parameters)
        return shortcuts
