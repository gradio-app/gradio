cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

pip install --upgrade pip
pip install pyright==1.1.298
pyright gradio/*.py client/python/gradio_client/*.py
