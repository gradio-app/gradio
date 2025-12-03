cd "$(dirname ${0})/.."
source scripts/helpers.sh

echo "Adding py.typed file to gradio."
touch gradio/py.typed

ty check --exclude test
