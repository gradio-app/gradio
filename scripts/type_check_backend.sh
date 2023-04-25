cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

pyright gradio/*.py
