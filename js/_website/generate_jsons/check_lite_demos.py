import os

def main():
    demo_to_reqs = {}
    for demo in os.listdir("demo"):
        requirements = ""
        # only check demos with requirements, because we don't need to check the others
        if os.path.exists(os.path.join("demo", demo, "requirements.txt")):
            with open(os.path.join("demo", demo, "requirements.txt"), "r") as f:
                requirements = f.read()
            demo_to_reqs[demo] = requirements.split("\n")
    non_lite_reqs = ['spacy', 'cmake', 'opencv-python-headless', 'torch==2.5.1', 'open3d', 'tensorflow', 'torch>=2.3.1', 'psycopg2', 'torchvision==0.13.0', 'onnxruntime-gpu', 'torchaudio==0.12.0', 'xgboost==1.7.6', 'torch', 'safetensors==0.4.3', 'torchaudio', 'torch==1.12.0', 'shap', 'prophet==1.1.2', 'gradio-pdf==0.0.7', 'datasets', 'gradio-datetimerange', 'safetensors>=0.4.1', 'safetensors>=0.4.1', 'numba>=0.45.1', 'safetensors>=0.4.1', 'safetensors>=0.4.3', 'torch>=2.0.0', 'safetensors>=0.3.1', 'safetensors>=0.3.1', 'safetensors>=0.4.1', 'torch', 'torch>=1.9', 'jiter<1,>=0.4.0', 'jiter<1,>=0.4.0', 'tokenizers<0.22,>=0.21', 'tokenizers<0.22,>=0.21', 'tokenizers<0.22,>=0.21', 'tokenizers<0.22,>=0.21', 'aiortc', 'psutil', 'psutil<6,>=2', 'psutil', 'numba>=0.53', 'zstandard<0.24.0,>=0.23.0', 'combo-lock~=0.2', 'ovos-bus-client<0.2.0,>=0.0.8', 'watchdog', 'combo-lock~=0.2', 'combo-lock~=0.2', 'pyee<12.0.0,>=8.1.0', 'combo-lock<1.0.0,>=0.2.1', 'git+https://github.com/huggingface/parler-tts.git', 'git+https://github.com/huggingface/transformers', 'git+https://github.com/nielsrogge/transformers.git@add_dpt_redesign#egg=transformers']
    non_lite_demos = []
    for demo, requirements in demo_to_reqs.items():
        for req in requirements:
            if req in non_lite_reqs:
                non_lite_demos.append(demo)
                break
    print(non_lite_demos)
    print(len(non_lite_demos))
if __name__ == "__main__":
    main()
