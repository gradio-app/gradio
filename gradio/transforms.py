"""
Ways to transform interfaces to produce new interfaces
"""
from gradio.interface import Interface

class Parallel(Interface):
    def __init__(self, *interfaces, **options):
        fns = []
        outputs = []
        
        for io in interfaces:
            fns.extend(io.predict)
            outputs.extend(io.output_interfaces)
    
        super().__init__(fn=fns, inputs=interfaces[0].input_interfaces, outputs=outputs, 
                         repeat_outputs_per_model=False, **options) 


class Series(Interface):
    def __init__(self, *interfaces, **options):
        fns = [io.predict for io in interfaces]
    
        def connected_fn(data):  # Run each function with the appropriate preprocessing and postprocessing 
            data = [data] # put it in a list before it gets unraveled
            for idx, io in enumerate(interfaces):
                # skip preprocessing for first interface since the compound interface will include it
                if idx > 0:
                    data = [input_interface.preprocess(data[i]) for i, input_interface in enumerate(io.input_interfaces)]
                # run all of predictions sequentially
                predictions = []
                for predict_fn in io.predict:
                    prediction = predict_fn(*data)
                    predictions.append(prediction)
                data = predictions
                # skip postprocessing for final interface since the compound interface will include it
                if idx < len(interfaces) - 1:
                    data = [output_interface.postprocess(data[i]) for i, output_interface in enumerate(io.output_interfaces)]
            return data[0]
    
        connected_fn.__name__ = " => ".join([f[0].__name__ for f in fns])

        super().__init__(connected_fn, interfaces[0].input_interfaces, interfaces[-1].output_interfaces, **options)

