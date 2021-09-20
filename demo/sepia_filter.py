import gradio as gr
import numpy as np

def sepia(input_img):
  sepia_filter = np.array([[.393, .769, .189],
                           [.349, .686, .168],
                           [.272, .534, .131]])
  sepia_img = input_img.dot(sepia_filter.T)
  sepia_img /= sepia_img.max()                          
  return sepia_img

iface = gr.Interface(sepia, gr.inputs.Image(shape=(200, 200)), "image", 
                     article=
"""
This simple image demo returns applies a sepia filter to the input image, as described below: 
```python
sepia_filter = np.array([[.393, .769, .189],
                          [.349, .686, .168],
                          [.272, .534, .131]])
sepia_img = input_img.dot(sepia_filter.T)
sepia_img /= sepia_img.max()                          
```
"""
)

if __name__ == "__main__":
    iface.launch()