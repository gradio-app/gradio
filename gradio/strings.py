import requests
import json


MESSAGING_API_ENDPOINT = "https://api.gradio.app/gradio-messaging/en"

en = {  
    "BETA_MESSAGE": "NOTE: Gradio is in beta stage, please report all bugs to: gradio.app@gmail.com",
    "RUNNING_LOCALLY": "Running locally at: {}",
    "NGROK_NO_INTERNET": "Unable to create public link for interface, please check internet connection or try "
                        "restarting python interpreter.",
    "COLAB_NO_LOCAL": "Cannot display local interface on google colab, public link created.",
    "PUBLIC_SHARE_TRUE": "To create a public link, set `share=True` in `launch()`.",
    "MODEL_PUBLICLY_AVAILABLE_URL": "Model available publicly at: {} (may take up to a minute for link to be usable)",
    "GENERATING_PUBLIC_LINK": "Generating public link (may take a few seconds...):",
    "TF1_ERROR": "It looks like you might be using tensorflow < 2.0. Please pass capture_session=True in Interface() to"
                " avoid the 'Tensor is not an element of this graph.' error.",
    "BETA_INVITE": "\nWe want to invite you to become a beta user.\nYou'll get early access to new and premium "
                "features (persistent links, hosting, and more).\nIf you're interested please email beta@gradio.app\n",
    "COLAB_DEBUG_TRUE": "Colab notebook detected. This cell will run indefinitely so that you can see errors and logs. "
                      "To turn off, set debug=False in launch().",
    "COLAB_DEBUG_FALSE": "Colab notebook detected. To show errors in colab notebook, set debug=True in launch()",
    "SHARE_LINK_MESSAGE": "This share link will expire in 24 hours. If you need a permanent link, visit: https://gradio.app/introducing-hosted (NEW!)",
    "SHARE_LINK_DISPLAY": "Running on External URL: {}",
    "INLINE_DISPLAY_BELOW": "Interface loading below...",
    "TIP_INTERPRETATION": "Tip: Add interpretation to your model by simply adding `interpretation=\"default\"` to `Interface()`",
    "TIP_EMBEDDING": "Tip: View embeddings of your dataset by simply adding `embedding=\"default\"` to `Interface()`",
}

try:
    updated_messaging = requests.get(MESSAGING_API_ENDPOINT).json()
    en.update(updated_messaging)
except (requests.ConnectionError, json.decoder.JSONDecodeError):  # Use default messaging
    pass
