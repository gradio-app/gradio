try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='gradio',
    version='0.4.1',
    include_package_data=True,
    description='Python library for easily interacting with trained machine learning models',
    author='Abubakar Abid',
    author_email='a12d@stanford.edu',
    url='https://github.com/abidlabs/gradio',
    packages=['gradio'],
    keywords=['machine learning', 'visualization', 'reproducibility'],
    install_requires=[
        'numpy',
        'websockets',
        'nest_asyncio',
        'beautifulsoup4',
        'Pillow',
        'requests',
        'psutil',
    ],
)
