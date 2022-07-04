try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup
from pathlib import Path
import re

this_directory = Path(__file__).parent

long_description = (this_directory / "README.md").read_text(encoding='utf8')
# Replace relative paths to images with absolute paths
long_description = re.sub("website/homepage/", "https://raw.githubusercontent.com/gradio-app/gradio/main/website/homepage/", long_description)
long_description = re.sub(r"demo/([\S]*.gif)", r"https://raw.githubusercontent.com/gradio-app/gradio/main/demo/\g<1>", long_description)

version = (this_directory / "gradio" / "version.txt").read_text(
    encoding='utf8').strip()

with open("requirements.txt") as reqs:
    requirements = reqs.readlines()

setup(
    name="gradio",
    version=version,
    include_package_data=True,
    description="Python library for easily interacting with trained machine learning models",
    long_description=long_description,
    long_description_content_type='text/markdown',
    author="Abubakar Abid, Ali Abid, Ali Abdalla, Dawood Khan, Ahsen Khaliq, Pete Allen, Ömer Faruk Özdemir",
    author_email="team@gradio.app",
    url="https://github.com/gradio-app/gradio",
    packages=["gradio"],
    license="Apache License 2.0",
    keywords=["machine learning", "visualization", "reproducibility"],
    install_requires=requirements,
    entry_points={
        'console_scripts': ['gradio=gradio.reload:run_in_reload_mode']
    },
    python_requires='>=3.7',
)
