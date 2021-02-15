import requests
import pkg_resources
from distutils.version import StrictVersion
from IPython import get_ipython
analytics_url = 'https://api.gradio.app/'
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"


def version_check():
    try:
        current_pkg_version = pkg_resources.require("gradio")[0].version
        latest_pkg_version = requests.get(url=PKG_VERSION_URL).json()["version"]
        if StrictVersion(latest_pkg_version) > StrictVersion(current_pkg_version):
            print("IMPORTANT: You are using gradio version {}, "
                    "however version {} "
                    "is available, please upgrade.".format(
                current_pkg_version, latest_pkg_version))
            print('--------')
    except:  # TODO(abidlabs): don't catch all exceptions
        pass


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
        error_analytics("NameError")
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


def readme_to_html(article):
    try:
        response = requests.get(article)
        if response.status_code == requests.codes.ok:
            article = response.text
    except requests.exceptions.RequestException:
        pass
    return article
