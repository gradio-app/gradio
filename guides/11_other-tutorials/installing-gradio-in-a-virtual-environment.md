# Installing Gradio in a Virtual Environment

Tags: INSTALLATION

In this guide, we will describe step-by-step how to install `gradio` within a virtual environment. This guide will cover both Windows and MacOS/Linux systems.

## Virtual Environments

A virtual environment in Python is a self-contained directory that holds a Python installation for a particular version of Python, along with a number of additional packages. This environment is isolated from the main Python installation and other virtual environments. Each environment can have its own independent set of installed Python packages, which allows you to maintain different versions of libraries for different projects without conflicts.


Using virtual environments ensures that you can work on multiple Python projects on the same machine without any conflicts. This is particularly useful when different projects require different versions of the same library. It also simplifies dependency management and enhances reproducibility, as you can easily share the requirements of your project with others.


## Installing Gradio on Windows

To install Gradio on a Windows system in a virtual environment, follow these steps:

1. **Install Python**: Ensure you have Python 3.10 or higher installed. You can download it from [python.org](https://www.python.org/). You can verify the installation by running `python --version` or `python3 --version` in Command Prompt.


2. **Create a Virtual Environment**:
   Open Command Prompt and navigate to your project directory. Then create a virtual environment using the following command:

   ```bash
   python -m venv gradio-env
   ```

   This command creates a new directory `gradio-env` in your project folder, containing a fresh Python installation.

3. **Activate the Virtual Environment**:
   To activate the virtual environment, run:

   ```bash
   .\gradio-env\Scripts\activate
   ```

   Your command prompt should now indicate that you are working inside `gradio-env`. Note: you can choose a different name than `gradio-env` for your virtual environment in this step.


4. **Install Gradio**:
   Now, you can install Gradio using pip:

   ```bash
   pip install gradio
   ```

5. **Verification**:
   To verify the installation, run `python` and then type:

   ```python
   import gradio as gr
   print(gr.__version__)
   ```

   This will display the installed version of Gradio.

## Installing Gradio on MacOS/Linux

The installation steps on MacOS and Linux are similar to Windows but with some differences in commands.

1. **Install Python**:
   Python usually comes pre-installed on MacOS and most Linux distributions. You can verify the installation by running `python --version` in the terminal (note that depending on how Python is installed, you might have to use `python3` instead of `python` throughout these steps). 
   
   Ensure you have Python 3.10 or higher installed. If you do not have it installed, you can download it from [python.org](https://www.python.org/). 

2. **Create a Virtual Environment**:
   Open Terminal and navigate to your project directory. Then create a virtual environment using:

   ```bash
   python -m venv gradio-env
   ```

   Note: you can choose a different name than `gradio-env` for your virtual environment in this step.

3. **Activate the Virtual Environment**:
   To activate the virtual environment on MacOS/Linux, use:

   ```bash
   source gradio-env/bin/activate
   ```

4. **Install Gradio**:
   With the virtual environment activated, install Gradio using pip:

   ```bash
   pip install gradio
   ```

5. **Verification**:
   To verify the installation, run `python` and then type:

   ```python
   import gradio as gr
   print(gr.__version__)
   ```

   This will display the installed version of Gradio.

By following these steps, you can successfully install Gradio in a virtual environment on your operating system, ensuring a clean and managed workspace for your Python projects.