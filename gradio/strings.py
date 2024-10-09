import os
import threading

import httpx

from gradio import wasm_utils

MESSAGING_API_ENDPOINT = "https://api.gradio.app/gradio-messaging/en"

en = {
    "RUNNING_LOCALLY": "* Running on local URL:  {}://{}:{}",
    "RUNNING_LOCALLY_SSR": "* Running on local URL:  {}://{}:{}, with SSR ⚡",
    "SHARE_LINK_DISPLAY": "* Running on public URL: {}",
    "COULD_NOT_GET_SHARE_LINK": "\nCould not create share link. Please check your internet connection or our status page: https://status.gradio.app.",
    "COULD_NOT_GET_SHARE_LINK_MISSING_FILE": "\nCould not create share link. Missing file: {}. \n\nPlease check your internet connection. This can happen if your antivirus software blocks the download of this file. You can install manually by following these steps: \n\n1. Download this file: {}\n2. Rename the downloaded file to: {}\n3. Move the file to this location: {}",
    "COLAB_NO_LOCAL": "Cannot display local interface on google colab, public link created.",
    "PUBLIC_SHARE_TRUE": "\nTo create a public link, set `share=True` in `launch()`.",
    "MODEL_PUBLICLY_AVAILABLE_URL": "Model available publicly at: {} (may take up to a minute for link to be usable)",
    "GENERATING_PUBLIC_LINK": "Generating public link (may take a few seconds...):",
    "BETA_INVITE": "\nThanks for being a Gradio user! If you have questions or feedback, please join our Discord server and chat with us: https://discord.gg/feTf9x3ZSB",
    "COLAB_DEBUG_TRUE": "Colab notebook detected. This cell will run indefinitely so that you can see errors and logs. "
    "To turn off, set debug=False in launch().",
    "COLAB_DEBUG_FALSE": "Colab notebook detected. To show errors in colab notebook, set debug=True in launch()",
    "COLAB_WARNING": "Note: opening Chrome Inspector may crash demo inside Colab notebooks.",
    "SHARE_LINK_MESSAGE": "\nThis share link expires in 72 hours. For free permanent hosting and GPU upgrades, run `gradio deploy` from the terminal in the working directory to deploy to Hugging Face Spaces (https://huggingface.co/spaces)",
    "INLINE_DISPLAY_BELOW": "Interface loading below...",
    "COULD_NOT_GET_SHARE_LINK_CHECKSUM": "\nCould not create share link. Checksum mismatch for file: {}.",
}


def get_updated_messaging(en: dict):
    try:
        updated_messaging = httpx.get(MESSAGING_API_ENDPOINT, timeout=3).json()
        en.update(updated_messaging)
    except Exception:  # Use default messaging
        pass


if os.getenv("GRADIO_ANALYTICS_ENABLED", "True") == "True" and not wasm_utils.IS_WASM:
    threading.Thread(target=get_updated_messaging, args=(en,)).start()
