cd "$(dirname ${0})/.."
source scripts/helpers.sh

pip_required

echo "Adding py.typed file to gradio."
touch gradio/py.typed

python -m pyright
