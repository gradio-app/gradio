cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

python -m pyright gradio/*.py gradio/components/*.py
