try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup
from pathlib import Path

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding='utf8')

setup(
    name="gradio",
    version="3.0.10",
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
    entry_points={
        'console_scripts': ['gradio=gradio.reload:run_in_reload_mode']
    },
)
