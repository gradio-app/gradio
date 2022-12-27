cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

pip install --upgrade pip
pip install pyright
<<<<<<< HEAD
cd gradio
pyright blocks.py components.py context.py data_classes.py deprecation.py documentation.py
=======
pyright gradio/context.py  gradio/blocks.py
>>>>>>> main
