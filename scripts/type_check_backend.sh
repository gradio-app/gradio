cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

pip install --upgrade pip
pip install mypy
mypy --strict gradio/context.py  gradio/blocks.py
