"""
Ways to transform interfaces to produce new interfaces
"""
from gradio.interface import Interface

def parallel(*interfaces, **options):
    fns = []
    outputs = []
    
    for io in interfaces:
        fns.extend(io.predict)
        outputs.extend(io.output_interfaces)
    
    return Interface(fn=fns, inputs=interfaces[0].input_interfaces, outputs=outputs, 
                     repeat_outputs_per_model=False, **options) 


def series(*interfaces, **options):
    fns = [io.predict for io in interfaces]
    
    def connected_fn(data):  # actually not used.
        for fn in fns:
            data = fn(data)
        return data
    
    connected_fn.__name__ = " => ".join([f[0].__name__ for f in fns])

    def connected_process_fn(data):  # we have to include the pre/postprocessing of every interface
        for io in interfaces:
            data = io.process(data)
        return data

    io = Interface(connected_fn, interfaces[0].input_interfaces, interfaces[-1].output_interfaces, **options)
    io.process = connected_process_fn
    return io    

