# change version.txt and run `bash build_script.sh`
rm -r dist
bash scripts/build_frontend.sh
bash scripts/install_gradio.sh
python3 -m build
python3 -m twine upload dist/*

# pip uninstall gradio-version-freeze -y
# pip install dist/gradio_version_freeze-3.32.1.3.39-py3-none-any.whl