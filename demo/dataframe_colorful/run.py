import pandas as pd 
import gradio as gr

# Creating a sample dataframe
def run():
  df = pd.DataFrame({
      "A" : [14, 4, 5, 4, -1], 
      "B" : [5, 2, 54, 3, 2], 
      "C" : [20, 20, 7, 3, 8], 
      "D" : [14, 3, 6, 2, 6], 
      "E" : [23, 45, 64, 32, 23]
  }) 
  df = df.style.map(color_num, subset=["A"])
  print(df.to_html())
  return df

# Function to apply text color

def color_num(value: float) -> str:
    color = "red" if value >= 0 else "green"
    color_style = "color: {}".format(color)
    return color_style

# Displaying the styled dataframe in Gradio
with gr.Blocks() as demo:
    gr.Textbox("{}".format(gr.__version__))
    a = gr.DataFrame()
    b = gr.Button("run")
    b.click(run,outputs=a)
    
if __name__ == "__main__":
    demo.launch()
