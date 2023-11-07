import gradio as gr

def echo(params):
    print(params)
    return params

def get_params(request: gr.Request):
  params = request.query_params
  ip = request.client.host
  return {"params": params, 
          "ip": ip}

  
with gr.Blocks() as demo:
  url_params = gr.State()
  text_in = gr.Textbox()
  text_out = gr.JSON()
  btn = gr.Button()
  btn.click(echo, inputs=[url_params], outputs=[text_out])
  demo.load(get_params, None, url_params, queue=True)
  #demo.load(get_params, None, url_params, queue=False)

demo.queue().launch()
