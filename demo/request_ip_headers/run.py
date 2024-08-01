import gradio as gr

def predict(text, request: gr.Request):
    headers = request.headers
    host = request.client.host
    user_agent = request.headers["user-agent"]
    return {
        "ip": host,
        "user_agent": user_agent,
        "headers": headers,
    }

gr.Interface(predict, "text", "json").launch()
