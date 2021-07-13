try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='gradio',
    version='2.1.6',
    include_package_data=True,
    description='Python library for easily interacting with trained machine learning models',
    author='Abubakar Abid',
    author_email='a12d@stanford.edu',
    url='https://github.com/gradio-app/gradio-UI',
    packages=['gradio'],
    license='Apache License 2.0',
    keywords=['machine learning', 'visualization', 'reproducibility'],
    install_requires=[
        'numpy',
        'scipy',
        'matplotlib',
        'pandas',
        'pillow',
        'ffmpy',
        'markdown2',
        'pycryptodome',
        'requests',
        'paramiko',
        'analytics-python',
        'Flask>=1.1.1',
        'Flask-Cors>=3.0.8',
        'flask-cachebuster',
        'Flask-Login',
    ],
)
