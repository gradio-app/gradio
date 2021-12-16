import gradio
import analytics
import requests
from distutils.version import StrictVersion
import json
import json.decoder
import os
import pkg_resources
import warnings
import random
from socket import gaierror
from urllib3.exceptions import MaxRetryError


analytics_url = 'https://api.gradio.app/'
PKG_VERSION_URL = "https://api.gradio.app/pkg-version"
analytics.write_key = "uxIFddIEuuUcFLf9VgH2teTEtPlWdkNy"
JSON_PATH = os.path.join(os.path.dirname(gradio.__file__), "launches.json")


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
    except pkg_resources.DistributionNotFound:
        warnings.warn("gradio is not setup or installed properly. Unable to get version info.")
    except json.decoder.JSONDecodeError:
        warnings.warn("unable to parse version details from package URL.")
    except KeyError:
        warnings.warn("package URL does not contain version info.")
    except:
        warnings.warn("unable to connect with package URL to collect version info.")


def initiated_analytics(data):
    try:
        requests.post(analytics_url + 'gradio-initiated-analytics/',
                        data=data, timeout=3)
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def launch_analytics(data):
    try:
        requests.post(analytics_url + 'gradio-launched-analytics/',
                        data=data, timeout=3)
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def integration_analytics(data):
    try:
        requests.post(analytics_url + 'gradio-integration-analytics/',
                        data=data, timeout=3)
    except (
            requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def error_analytics(type):
    """
    Send error analytics if there is network
    :param type: RuntimeError or NameError
    """
    data = {'error': '{} in launch method'.format(type)}
    try:
        requests.post(analytics_url + 'gradio-error-analytics/',
                      data=data, timeout=3)
    except (requests.ConnectionError, requests.exceptions.ReadTimeout):
        pass  # do not push analytics if no network


def colab_check():
    """
    Check if interface is launching from Google Colab
    :return is_colab (bool): True or False
    """
    is_colab = False
    try:  # Check if running interactively using ipython.
        from IPython import get_ipython
        from_ipynb = get_ipython()
        if "google.colab" in str(from_ipynb):
            is_colab = True
    except (ImportError, NameError):
        error_analytics("NameError")
    return is_colab


def ipython_check():
    """
    Check if interface is launching from iPython (not colab)
    :return is_ipython (bool): True or False
    """
    is_ipython = False
    try:  # Check if running interactively using ipython.
        from IPython import get_ipython
        if get_ipython() is not None:
            is_ipython = True
    except (ImportError, NameError):
        pass
    return is_ipython


def readme_to_html(article):
    try:
        response = requests.get(article, timeout=3)
        if response.status_code == requests.codes.ok:  #pylint: disable=no-member
            article = response.text
    except requests.exceptions.RequestException:
        pass
    return article


def show_tip(io):
    # Only show tip every other use.
    if io.show_tips and random.random() < 0.5:
        print(random.choice(gradio.strings.en.TIPS))


def launch_counter():
    try:
        if not os.path.exists(JSON_PATH):
            launches = {"launches": 1}
            with open(JSON_PATH, "w+") as j:
                json.dump(launches, j)
        else:
            with open(JSON_PATH) as j:
                launches = json.load(j)
            launches["launches"] += 1
            if launches["launches"] in [25, 50]:
                print(gradio.strings.en["BETA_INVITE"])
            with open(JSON_PATH, "w") as j:
                j.write(json.dumps(launches))
    except:
        pass


