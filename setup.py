try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='gradio',
    version='1.6.0',
    include_package_data=True,
    description='Python library for easily interacting with trained machine learning models',
    author='Abubakar Abid',
    author_email='a12d@stanford.edu',
    url='https://github.com/gradio-app/gradio-UI',
    packages=['gradio'],
    keywords=['machine learning', 'visualization', 'reproducibility'],
    install_requires=[
        'numpy',
        'requests',
        'Flask>=1.1.1',
        'Flask-Cors>=3.0.8',
        'flask-cachebuster',
        'Flask-BasicAuth',
        'paramiko',
        'scipy',
        'IPython',
        'scikit-image',
        'analytics-python',
        'pandas',
        'ffmpy',
        'markdown2'
    ],
)
