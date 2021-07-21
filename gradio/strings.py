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
    "PRIVATE_LINK_MESSAGE": "Since this is a private endpoint, this share link will never expire.",
    "SHARE_LINK_DISPLAY": "Running on External URL: {}",
    "INLINE_DISPLAY_BELOW": "Interface loading below...",
    "MEDIA_PERMISSIONS_IN_COLAB": "Your interface requires microphone or webcam permissions - this may cause issues in Colab. Use the External URL in case of issues.",
    "TIPS": [
        "You can add authentication to your app with the auth= kwarg in the launch command; for example: gr.Interface(...).launch(auth=('username', 'password'))",
        "Let users specify why they flagged input with the flagging_options= kwarg; for example: gr.Interface(..., flagging_options=['too slow', 'incorrect output', 'other'])",
        "You can show or hide the buttons for flagging, screenshots, and interpretation with the allow_*= kwargs; for example: gr.Interface(..., allow_screenshot=True, allow_flagging=False)",
        "The inputs and outputs flagged by the users are stored in the flagging directory, specified by the flagging_dir= kwarg. You can view this data through the interface by setting the examples= kwarg to the flagging directory; for example gr.Interface(..., examples='flagged')",
        "You can add a title and description to your interface using the title= and description= kwargs. The article= kwarg can be used to add markdown or HTML under the interface; for example gr.Interface(..., title='My app', description='Lorem ipsum')"
    ]
}

try:
    updated_messaging = requests.get(MESSAGING_API_ENDPOINT, timeout=3).json()
    en.update(updated_messaging)
except (requests.ConnectionError, requests.exceptions.ReadTimeout, json.decoder.JSONDecodeError):  # Use default messaging
    pass
