# # equivalent, but works
import gradio
def f(audio):
    return str(audio)
gradio.Interface(f, gradio.Audio(), gradio.Textbox()).launch()
# import inspect

# def add_numbers(a, b):
#     return a + b

# param_names = inspect.getfullargspec(add_numbers)
# print(param_names)
