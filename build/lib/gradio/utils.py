import requests
from IPython import get_ipython
analytics_url = 'https://api.gradio.app/'


def error_analytics(type):
    """
    Send error analytics if there is network
    :param type: RuntimeError or NameError
    """
    data = {'error': '{} in launch method'.format(type)}
    try:
        requests.post(analytics_url + 'gradio-error-analytics/',
                      data=data)
    except requests.ConnectionError:
        pass  # do not push analytics if no network


def colab_check():
    """
    Check if interface is launching from Google Colab
    :return is_colab (bool): True or False
    """
    is_colab = False
    try:  # Check if running interactively using ipython.
        from_ipynb = get_ipython()
        if "google.colab" in str(from_ipynb):
            is_colab = True
    except NameError:
        error_analytics("NameError", analytics_url)
    return is_colab


def ipython_check():
    """
    Check if interface is launching from iPython (not colab)
    :return is_ipython (bool): True or False
    """
    try:  # Check if running interactively using ipython.
        get_ipython()
        is_ipython = True
    except NameError:
        is_ipython = False
    return is_ipython