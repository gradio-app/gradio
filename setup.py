try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup
from pathlib import Path

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name="gradio",
    version="2.9b26",
    include_package_data=True,
    description="Python library for easily interacting with trained machine learning models",
    long_description=long_description,
    long_description_content_type='text/markdown',
    author="Abubakar Abid, Ali Abid, Ali Abdalla, Dawood Khan, Ahsen Khaliq, Pete Allen, Ömer Faruk Özdemir",
    author_email="team@gradio.app",
    url="https://github.com/gradio-app/gradio-UI",
    packages=["gradio"],
    license="Apache License 2.0",
    keywords=["machine learning", "visualization", "reproducibility"],
    install_requires=[
        "analytics-python",
        "aiohttp",
        "fastapi",
        "ffmpy",
        "markdown-it-py[linkify,plugins]",
        "matplotlib",
        "numpy",
        "orjson",
        "pandas",
        "paramiko",
        "pillow",
        "pycryptodome",
        "python-multipart",
        "pydub",
        "requests",
        "uvicorn",
        "Jinja2"
    ],
)
