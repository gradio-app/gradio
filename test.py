# encoding: utf8

"""
Created on 2019.07.14

@author: yalei
"""


import gradio

# A very simplistic function that capitalizes each letter in the given string
def big(x):
    return x.upper()

io = gradio.Interface(inputs="textbox", outputs="textbox", 
                      model=big, model_type='pyfunc')
# io.launch(inline=False, inbrowser=True, share=True)
io.launch()