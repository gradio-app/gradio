try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name="gradio",
    version="2.9.4",
    include_package_data=True,
    description="Python library for easily interacting with trained machine learning models",
    author="Abubakar Abid, Ali Abid, Ali Abdalla, Dawood Khan, Ahsen Khaliq, Pete Allen, Ömer Faruk Özdemir",
    author_email="team@gradio.app",
    url="https://github.com/gradio-app/gradio-UI",
    packages=["gradio"],
    license="Apache License 2.0",
    keywords=["machine learning", "visualization", "reproducibility"],
    install_requires=[
        "analytics-python",
        "aiohttp",
        "httpx",
        "fastapi",
        "ffmpy",
        "markdown-it-py[linkify,plugins]",
        "matplotlib",
        "numpy",
        "orjson",
        "pandas",
        "paramiko",
        "pillow",
        "pydantic",
        "pycryptodome",
        "python-multipart",
        "pydub",
        "requests",
        "uvicorn",
        "Jinja2"
    ],
)
