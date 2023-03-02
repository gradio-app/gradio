cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

pip install --upgrade pip
pip install pyright
pyright gradio/*.py
