from gradio.interface import Interface

class Parallel:
    def __init__(self, interfaces):
        fns = []
        for io in interfaces:
            fns.extend(io.predict)

        self.interfaces = interfaces
        self.predict = fns
        self.compound_interface = Interface(
            fn=fns, inputs=interfaces[0].input_interfaces, outputs=interfaces[0].output_interfaces)
    
    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = "Gradio Parallel Interface, consisting of:"
        repr += "\n-----------------------------------------"
        for i, io in enumerate(self.interfaces):
            repr += "\n  " + str(io).replace("\n", "\n  ")
            if i < len(self.interfaces) - 1:  # Don't apply to last interface.
                repr += "\n&"
        return repr

    def launch(self, *args, **kwargs):
        return self.compound_interface.launch(*args, **kwargs)


class Sequential:
    def __init__(self, interfaces):
        fns = []
        for io in interfaces:
            fns.extend(io.predict)

        def cascaded_fn(inp):
            out = inp
            for fn in fns:
                out = fn(out)
            return out

        cascaded_fn.__name__ = " => ".join([f.__name__ for f in fns])

        self.interfaces = interfaces
        self.predict = [cascaded_fn]
        self.input_interfaces = interfaces[0].input_interfaces
        self.output_interfaces = interfaces[-1].output_interfaces
        self.compound_interface = Interface(
            fn=cascaded_fn, inputs=self.input_interfaces, outputs=self.output_interfaces)
    
    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        repr = "Gradio Sequential Interface, consisting of:"
        repr += "\n-----------------------------------------"
        for i, io in enumerate(self.interfaces):
            repr += "\n  " + str(io).replace("\n", "\n  ")
            if i < len(self.interfaces) - 1:  # Don't apply to last interface.
                repr += "\n=>"
        return repr

    def launch(self, *args, **kwargs):
        return self.compound_interface.launch(*args, **kwargs)
