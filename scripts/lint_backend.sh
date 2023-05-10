#!/bin/bash

cd "$(dirname ${0})/.."
ruff gradio test client
black --check gradio test client
