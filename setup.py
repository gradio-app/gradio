try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='gradio',
    version='2.6.4b3',
    include_package_data=True,
    description='Python library for easily interacting with trained machine learning models',
    author='Abubakar Abid, Ali Abid, Ali Abdalla, Dawood Khan, Ahsen Khaliq',
    author_email='team@gradio.app',
    url='https://github.com/gradio-app/gradio-UI',
    packages=['gradio'],
    license='Apache License 2.0',
    keywords=['machine learning', 'visualization', 'reproducibility'],
    install_requires=[
        'analytics-python',
        'aiohttp',
        'fastapi',
        'ffmpy',
        'markdown2',
        'matplotlib',
        'numpy',
        'pandas',
        'paramiko',
        'pillow',
        'pycryptodome',
        'python-multipart',
        'pydub',
        'requests',
        'uvicorn',
    ],
)
