import gradio as gr

icon = "https://cdn.icon-icons.com/icons2/2620/PNG/512/among_us_player_red_icon_156942.png"
with gr.Blocks() as demo:
   with gr.Row():
      gr.Button(variant="primary")
      gr.Button(variant="secondary")
      gr.Button(variant="stop")
   with gr.Row():
      gr.Button(variant="primary", size="sm")
      gr.Button(variant="secondary", size="sm")
      gr.Button(variant="stop", size="sm")
   with gr.Row():
      gr.Button(variant="primary", icon=icon)
      gr.Button(variant="secondary", icon=icon)
      gr.Button(variant="stop", icon=icon)

   with gr.Row():
      gr.Button(variant="primary", size="sm", icon=icon)
      gr.Button(variant="secondary", size="sm", icon=icon)
      gr.Button(variant="stop", size="sm", icon=icon)

   with gr.Row():
      gr.Button(variant="primary", icon=icon, interactive=False)
      gr.Button(variant="secondary", icon=icon, interactive=False)
      gr.Button(variant="stop", icon=icon, interactive=False)

   with gr.Row():
      gr.Button(variant="primary", size="sm", icon=icon, interactive=False)
      gr.Button(variant="secondary", size="sm", icon=icon, interactive=False)
      gr.Button(variant="stop", size="sm", icon=icon, interactive=False)

   with gr.Row():
      gr.Button(variant="primary", interactive=False)
      gr.Button(variant="secondary", interactive=False)
      gr.Button(variant="stop", interactive=False)

   with gr.Row():
      gr.Button(variant="primary", size="sm",  interactive=False)
      gr.Button(variant="secondary", size="sm", interactive=False)
      gr.Button(variant="stop", size="sm", interactive=False)

   with gr.Group():
      gr.Button(variant="primary")
      gr.Button(variant="primary")
      gr.Button(variant="secondary")
      gr.Button(variant="secondary")
      gr.Button(variant="stop")
      gr.Button(variant="stop")


demo.launch()
