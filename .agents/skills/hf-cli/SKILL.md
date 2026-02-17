---
name: hf-cli
description: >
  Hugging Face Hub CLI (`hf`) for downloading, uploading, and managing
  repositories, models, datasets, and Spaces on the Hugging Face Hub.
---

The Hugging Face Hub CLI tool `hf` is available. IMPORTANT: The `hf` command replaces the deprecated `huggingface_cli` command.

Use `hf --help` to view available functions. Note that auth commands are now all under `hf auth` e.g. `hf auth whoami`.
<!--⚠️ Note that this file is in Markdown but contains specific syntax for our doc-builder (similar to MDX) that may not be
rendered properly in your Markdown viewer.
-->

# Command Line Interface (CLI)

The `huggingface_hub` Python package comes with a built-in CLI called `hf`. This tool allows you to interact with the Hugging Face Hub directly from a terminal. For example, you can log in to your account, create a repository, upload and download files, etc. It also comes with handy features to configure your machine or manage your cache. In this guide, we will have a look at the main features of the CLI and how to use them.

> [!TIP]
> This guide covers the most important features of the `hf` CLI.
> For a complete reference of all commands and options, see the [CLI reference](../package_reference/cli.md).

## Getting started

### Standalone installer (Recommended)

You can install the `hf` CLI with a single command:

On macOS and Linux:

```bash
>>> curl -LsSf https://hf.co/cli/install.sh | bash
```

On Windows:

```powershell
>>> powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"
```

Once installed, you can check that the CLI is correctly set up:

```bash
>>> hf --help
Usage: hf [OPTIONS] COMMAND [ARGS]...

  Hugging Face Hub CLI

Options:
  --install-completion  Install completion for the current shell.
  --show-completion     Show completion for the current shell, to copy it or
                        customize the installation.
  --help                Show this message and exit.

Commands:
  auth                 Manage authentication (login, logout, etc.).
  cache                Manage local cache directory.
  datasets             Interact with datasets on the Hub.
  download             Download files from the Hub.
  endpoints            Manage Hugging Face Inference Endpoints.
  env                  Print information about the environment.
  jobs                 Run and manage Jobs on the Hub.
  models               Interact with models on the Hub.
  repo                 Manage repos on the Hub.
  repo-files           Manage files in a repo on the Hub.
  spaces               Interact with spaces on the Hub.
  upload               Upload a file or a folder to the Hub.
  upload-large-folder  Upload a large folder to the Hub.
  version              Print information about the hf version.
```

If the CLI is correctly installed, you should see a list of all the options available in the CLI. If you get an error message such as `command not found: hf`, please refer to the [Installation](../installation) guide.

> [!TIP]
> The `--help` option is very convenient for getting more details about a command. You can use it anytime to list all available options and their details. For example, `hf upload --help` provides more information on how to upload files using the CLI.

### Using uv

The easiest way to use the `hf` CLI is with [`uvx`](https://docs.astral.sh/uv/concepts/tools/). It always runs the latest version in an isolated environment - no installation needed!

Make sure `uv` is installed first. See the [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/) for instructions.

Then use the CLI directly:

```bash
>>> uvx hf auth login
>>> uvx hf download
>>> uvx hf ...
```

> [!TIP]
> `uvx hf` uses the [`hf` PyPI package](https://pypi.org/project/hf/).

### Install with pip

The CLI is also shipped with the core `huggingface_hub` package:

```bash
>>> pip install -U "huggingface_hub"
```

### Using Homebrew

You can also install the CLI using [Homebrew](https://brew.sh/):

```bash
>>> brew install huggingface-cli
```

Check out the Homebrew huggingface page [here](https://formulae.brew.sh/formula/huggingface-cli) for more details.

## hf auth login

In many cases, you must be logged in to a Hugging Face account to interact with the Hub (download private repos, upload files, create PRs, etc.). To do so, you need a [User Access Token](https://huggingface.co/docs/hub/security-tokens) from your [Settings page](https://huggingface.co/settings/tokens). The User Access Token is used to authenticate your identity to the Hub. Make sure to set a token with write access if you want to upload or modify content.

Once you have your token, run the following command in your terminal:

```bash
>>> hf auth login
```

This command will prompt you for a token. Copy-paste yours and press *Enter*. Then, you'll be asked if the token should also be saved as a git credential. Press *Enter* again (default to yes) if you plan to use `git` locally. Finally, it will call the Hub to check that your token is valid and save it locally.

```
_|    _|  _|    _|    _|_|_|    _|_|_|  _|_|_|  _|      _|    _|_|_|      _|_|_|_|    _|_|      _|_|_|  _|_|_|_|
_|    _|  _|    _|  _|        _|          _|    _|_|    _|  _|            _|        _|    _|  _|        _|
_|_|_|_|  _|    _|  _|  _|_|  _|  _|_|    _|    _|  _|  _|  _|  _|_|      _|_|_|    _|_|_|_|  _|        _|_|_|
_|    _|  _|    _|  _|    _|  _|    _|    _|    _|    _|_|  _|    _|      _|        _|    _|  _|        _|
_|    _|    _|_|      _|_|_|    _|_|_|  _|_|_|  _|      _|    _|_|_|      _|        _|    _|    _|_|_|  _|_|_|_|

To log in, `huggingface_hub` requires a token generated from https://huggingface.co/settings/tokens .
Enter your token (input will not be visible):
Add token as git credential? (Y/n)
Token is valid (permission: write).
Your token has been saved in your configured git credential helpers (store).
Your token has been saved to /home/wauplin/.cache/huggingface/token
Login successful
```

Alternatively, if you want to log-in without being prompted, you can pass the token directly from the command line. To be more secure, we recommend passing your token as an environment variable to avoid pasting it in your command history.

```bash
# Or using an environment variable
>>> hf auth login --token $HF_TOKEN --add-to-git-credential
Token is valid (permission: write).
The token `token_name` has been saved to /home/wauplin/.cache/huggingface/stored_tokens
Your token has been saved in your configured git credential helpers (store).
Your token has been saved to /home/wauplin/.cache/huggingface/token
Login successful
The current active token is: `token_name`
```

For more details about authentication, check out [this section](../quick-start#authentication).

## hf auth whoami

If you want to know if you are logged in, you can use `hf auth whoami`. This command doesn't have any options and simply prints your username and the organizations you are a part of on the Hub:

```bash
hf auth whoami
Wauplin
orgs:  huggingface,eu-test,OAuthTesters,hf-accelerate,HFSmolCluster
```

If you are not logged in, an error message will be printed.

## hf auth logout

This command logs you out. In practice, it will delete all tokens stored on your machine. If you want to remove a specific token, you can specify the token name as an argument.

This command will not log you out if you are logged in using the `HF_TOKEN` environment variable (see [reference](../package_reference/environment_variables#hftoken)). If that is the case, you must unset the environment variable in your machine configuration.

## hf download


Use the `hf download` command to download files from the Hub directly. Internally, it uses the same [`hf_hub_download`] and [`snapshot_download`] helpers described in the [Download](./download) guide and prints the returned path to the terminal. In the examples below, we will walk through the most common use cases. For a full list of available options, you can run:

```bash
hf download --help
```

### Download a single file

To download a single file from a repo, simply provide the repo_id and filename as follows:

```bash
>>> hf download gpt2 config.json
downloading https://huggingface.co/gpt2/resolve/main/config.json to /home/wauplin/.cache/huggingface/hub/tmpwrq8dm5o
(…)ingface.co/gpt2/resolve/main/config.json: 100%|██████████████████████████████████| 665/665 [00:00<00:00, 2.49MB/s]
/home/wauplin/.cache/huggingface/hub/models--gpt2/snapshots/11c5a3d5811f50298f278a704980280950aedb10/config.json
```

The command will always print on the last line the path to the file on your local machine.

To download a file located in a subdirectory of the repo, you should provide the path of the file in the repo in posix format like this:

```bash
>>> hf download HiDream-ai/HiDream-I1-Full text_encoder/model.safetensors
```

### Download an entire repository

In some cases, you just want to download all the files from a repository. This can be done by just specifying the repo id:

```bash
>>> hf download HuggingFaceH4/zephyr-7b-beta
Fetching 23 files:   0%|                                                | 0/23 [00:00<?, ?it/s]
...
...
/home/wauplin/.cache/huggingface/hub/models--HuggingFaceH4--zephyr-7b-beta/snapshots/3bac358730f8806e5c3dc7c7e19eb36e045bf720
```

### Download multiple files

You can also download a subset of the files from a repository with a single command. This can be done in two ways. If you already have a precise list of the files you want to download, you can simply provide them sequentially:

```bash
>>> hf download gpt2 config.json model.safetensors
Fetching 2 files:   0%|                                                                        | 0/2 [00:00<?, ?it/s]
downloading https://huggingface.co/gpt2/resolve/11c5a3d5811f50298f278a704980280950aedb10/model.safetensors to /home/wauplin/.cache/huggingface/hub/tmpdachpl3o
(…)8f278a7049802950aedb10/model.safetensors: 100%|██████████████████████████████| 8.09k/8.09k [00:00<00:00, 40.5MB/s]
Fetching 2 files: 100%|████████████████████████████████████████████████████████████████| 2/2 [00:00<00:00,  3.76it/s]
/home/wauplin/.cache/huggingface/hub/models--gpt2/snapshots/11c5a3d5811f50298f278a704980280950aedb10
```

The other approach is to provide patterns to filter which files you want to download using `--include` and `--exclude`. For example, if you want to download all safetensors files from [stabilityai/stable-diffusion-xl-base-1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0), except the files in FP16 precision:

```bash
>>> hf download stabilityai/stable-diffusion-xl-base-1.0 --include "*.safetensors" --exclude "*.fp16.*"*
Fetching 8 files:   0%|                                                                         | 0/8 [00:00<?, ?it/s]
...
...
Fetching 8 files: 100%|█████████████████████████████████████████████████████████████████████████| 8/8 (...)
/home/wauplin/.cache/huggingface/hub/models--stabilityai--stable-diffusion-xl-base-1.0/snapshots/462165984030d82259a11f4367a4eed129e94a7b
```

### Download a dataset or a Space

The examples above show how to download from a model repository. To download a dataset or a Space, use the `--repo-type` option:

```bash
# https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
>>> hf download HuggingFaceH4/ultrachat_200k --repo-type dataset

# https://huggingface.co/spaces/HuggingFaceH4/zephyr-chat
>>> hf download HuggingFaceH4/zephyr-chat --repo-type space

...
```

### Download a specific revision

The examples above show how to download from the latest commit on the main branch. To download from a specific revision (commit hash, branch name or tag), use the `--revision` option:

```bash
>>> hf download bigcode/the-stack --repo-type dataset --revision v1.1
...
```

### Download to a local folder

The recommended (and default) way to download files from the Hub is to use the cache-system. However, in some cases you want to download files and move them to a specific folder. This is useful to get a workflow closer to what git commands offer. You can do that using the `--local-dir` option.

A `.cache/huggingface/` folder is created at the root of your local directory containing metadata about the downloaded files. This prevents re-downloading files if they're already up-to-date. If the metadata has changed, then the new file version is downloaded. This makes the `local-dir` optimized for pulling only the latest changes.

> [!TIP]
> For more details on how downloading to a local file works, check out the [download](./download#download-files-to-a-local-folder) guide.

```bash
>>> hf download adept/fuyu-8b model-00001-of-00002.safetensors --local-dir fuyu
...
fuyu/model-00001-of-00002.safetensors
```

### Dry-run mode

In some cases, you would like to check which files would be downloaded before actually downloading them. You can check this using the `--dry-run` parameter. It lists all files to download on the repo and checks whether they are already downloaded or not. This gives an idea of how many files have to be downloaded and their sizes.

```sh
>>> hf download openai-community/gpt2 --dry-run
[dry-run] Fetching 26 files: 100%|█████████████| 26/26 [00:04<00:00,  6.26it/s]
[dry-run] Will download 11 files (out of 26) totalling 5.6G.
File                              Bytes to download
--------------------------------- -----------------
.gitattributes                    -
64-8bits.tflite                   125.2M
64-fp16.tflite                    248.3M
64.tflite                         495.8M
README.md                         -
config.json                       -
flax_model.msgpack                497.8M
generation_config.json            -
merges.txt                        -
model.safetensors                 548.1M
onnx/config.json                  -
onnx/decoder_model.onnx           653.7M
onnx/decoder_model_merged.onnx    655.2M
onnx/decoder_with_past_model.onnx 653.7M
onnx/generation_config.json       -
onnx/merges.txt                   -
onnx/special_tokens_map.json      -
onnx/tokenizer.json               -
onnx/tokenizer_config.json        -
onnx/vocab.json                   -
pytorch_model.bin                 548.1M
rust_model.ot                     702.5M
tf_model.h5                       497.9M
tokenizer.json                    -
tokenizer_config.json             -
vocab.json                        -
```

For more details, check out the [download guide](./download.md#dry-run-mode).

### Specify cache directory

If not using `--local-dir`, all files will be downloaded by default to the cache directory defined by the `HF_HOME` [environment variable](../package_reference/environment_variables#hfhome). You can specify a custom cache using `--cache-dir`:

```bash
>>> hf download adept/fuyu-8b --cache-dir ./path/to/cache
...
./path/to/cache/models--adept--fuyu-8b/snapshots/ddcacbcf5fdf9cc59ff01f6be6d6662624d9c745
```

### Specify a token

To access private or gated repositories, you must use a token. By default, the token saved locally (using `hf auth login`) will be used. If you want to authenticate explicitly, use the `--token` option:

```bash
>>> hf download gpt2 config.json --token=hf_****
/home/wauplin/.cache/huggingface/hub/models--gpt2/snapshots/11c5a3d5811f50298f278a704980280950aedb10/config.json
```

### Quiet mode

By default, the `hf download` command will be verbose. It will print details such as warning messages, information about the downloaded files, and progress bars. If you want to silence all of this, use the `--quiet` option. Only the last line (i.e. the path to the downloaded files) is printed. This can prove useful if you want to pass the output to another command in a script.

```bash
>>> hf download gpt2 --quiet
/home/wauplin/.cache/huggingface/hub/models--gpt2/snapshots/11c5a3d5811f50298f278a704980280950aedb10
```

### Download timeout

On machines with slow connections, you might encounter timeout issues like this one:
```bash
`httpx.TimeoutException: (TimeoutException("HTTPSConnectionPool(host='cdn-lfs-us-1.huggingface.co', port=443): Read timed out. (read timeout=10)"), '(Request ID: a33d910c-84c6-4514-8362-c705e2039d38)')`
```

To mitigate this issue, you can set the `HF_HUB_DOWNLOAD_TIMEOUT` environment variable to a higher value (default is 10):
```bash
export HF_HUB_DOWNLOAD_TIMEOUT=30
```

For more details, check out the [environment variables reference](../package_reference/environment_variables#hfhubdownloadtimeout). And rerun your download command.

## hf upload

Use the `hf upload` command to upload files to the Hub directly. Internally, it uses the same [`upload_file`] and [`upload_folder`] helpers described in the [Upload](./upload) guide. In the examples below, we will walk through the most common use cases. For a full list of available options, you can run:

```bash
>>> hf upload --help
```

### Upload an entire folder

The default usage for this command is:

```bash
# Usage:  hf upload [repo_id] [local_path] [path_in_repo]
```

To upload the current directory at the root of the repo, use:

```bash
>>> hf upload my-cool-model . .
https://huggingface.co/Wauplin/my-cool-model/tree/main/
```

> [!TIP]
> If the repo doesn't exist yet, it will be created automatically.

You can also upload a specific folder:

```bash
>>> hf upload my-cool-model ./models .
https://huggingface.co/Wauplin/my-cool-model/tree/main/
```

Finally, you can upload a folder to a specific destination on the repo:

```bash
>>> hf upload my-cool-model ./path/to/curated/data /data/train
https://huggingface.co/Wauplin/my-cool-model/tree/main/data/train
```

### Upload a single file

You can also upload a single file by setting `local_path` to point to a file on your machine. If that's the case, `path_in_repo` is optional and will default to the name of your local file:

```bash
>>> hf upload Wauplin/my-cool-model ./models/model.safetensors
https://huggingface.co/Wauplin/my-cool-model/blob/main/model.safetensors
```

If you want to upload a single file to a specific directory, set `path_in_repo` accordingly:

```bash
>>> hf upload Wauplin/my-cool-model ./models/model.safetensors /vae/model.safetensors
https://huggingface.co/Wauplin/my-cool-model/blob/main/vae/model.safetensors
```

### Upload multiple files

To upload multiple files from a folder at once without uploading the entire folder, use the `--include` and `--exclude` patterns. It can also be combined with the `--delete` option to delete files on the repo while uploading new ones. In the example below, we sync the local Space by deleting remote files and uploading all files except the ones in `/logs`:

```bash
# Sync local Space with Hub (upload new files except from logs/, delete removed files)
>>> hf upload Wauplin/space-example --repo-type=space --exclude="/logs/*" --delete="*" --commit-message="Sync local Space with Hub"
...
```

### Upload to a dataset or Space

To upload to a dataset or a Space, use the `--repo-type` option:

```bash
>>> hf upload Wauplin/my-cool-dataset ./data /train --repo-type=dataset
...
```

### Upload to an organization

To upload content to a repo owned by an organization instead of a personal repo, you must explicitly specify it in the `repo_id`:

```bash
>>> hf upload MyCoolOrganization/my-cool-model . .
https://huggingface.co/MyCoolOrganization/my-cool-model/tree/main/
```

### Upload to a specific revision

By default, files are uploaded to the `main` branch. If you want to upload files to another branch or reference, use the `--revision` option:

```bash
# Upload files to a PR
>>> hf upload bigcode/the-stack . . --repo-type dataset --revision refs/pr/104
...
```

**Note:** if `revision` does not exist and `--create-pr` is not set, a branch will be created automatically from the `main` branch.

### Upload and create a PR

If you don't have the permission to push to a repo, you must open a PR and let the authors know about the changes you want to make. This can be done by setting the `--create-pr` option:

```bash
# Create a PR and upload the files to it
>>> hf upload bigcode/the-stack . . --repo-type dataset --revision refs/pr/104
https://huggingface.co/datasets/bigcode/the-stack/blob/refs%2Fpr%2F104/
```

### Upload at regular intervals

In some cases, you might want to push regular updates to a repo. For example, this is useful if you're training a model and you want to upload the logs folder every 10 minutes. You can do this using the `--every` option:

```bash
# Upload new logs every 10 minutes
hf upload training-model logs/ --every=10
```

### Specify a commit message

Use the `--commit-message` and `--commit-description` to set a custom message and description for your commit instead of the default one

```bash
>>> hf upload Wauplin/my-cool-model ./models . --commit-message="Epoch 34/50" --commit-description="Val accuracy: 68%. Check tensorboard for more details."
...
https://huggingface.co/Wauplin/my-cool-model/tree/main
```

### Specify a token

To upload files, you must use a token. By default, the token saved locally (using `hf auth login`) will be used. If you want to authenticate explicitly, use the `--token` option:

```bash
>>> hf upload Wauplin/my-cool-model ./models . --token=hf_****
...
https://huggingface.co/Wauplin/my-cool-model/tree/main
```

### Quiet mode

By default, the `hf upload` command will be verbose. It will print details such as warning messages, information about the uploaded files, and progress bars. If you want to silence all of this, use the `--quiet` option. Only the last line (i.e. the URL to the uploaded files) is printed. This can prove useful if you want to pass the output to another command in a script.

```bash
>>> hf upload Wauplin/my-cool-model ./models . --quiet
https://huggingface.co/Wauplin/my-cool-model/tree/main
```

## hf upload-large-folder

Use `hf upload-large-folder` to upload very large folders (hundreds of GBs or even TBs) to the Hub. This command is optimized for resumable uploads and handles failures gracefully.

```bash
# Upload a large folder to a model repository
>>> hf upload-large-folder Wauplin/my-cool-model ./large_model_dir

# Upload to a specific revision
>>> hf upload-large-folder Wauplin/my-cool-model ./large_model_dir --revision v1.0

# Upload a dataset
>>> hf upload-large-folder Wauplin/my-cool-dataset ./large_data_dir --repo-type dataset
```

The command automatically:
- Splits large files into chunks for reliable uploads
- Resumes interrupted uploads from where they left off
- Handles network failures gracefully

> [!TIP]
> Use `hf upload-large-folder` when you have very large files or folders that may take a long time to upload. For smaller uploads, prefer `hf upload`.

## hf models

Use `hf models` to list models on the Hub and get detailed information about a specific model.

### List models

```bash
# List trending models
>>> hf models ls

# Search for models
>>> hf models ls --search "lora"

# Filter by author
>>> hf models ls --author Qwen

# Sort by downloads
>>> hf models ls --sort downloads --limit 10
```

### Get model info

```bash
>>> hf models info Lightricks/LTX-2
```

Use `--expand` to fetch additional properties like `downloads`, `likes`, `tags`, etc.

## hf datasets

Use `hf datasets` to list datasets on the Hub and get detailed information about a specific dataset.

### List datasets

```bash
# List trending datasets
>>> hf datasets ls

# Search for datasets
>>> hf datasets ls --search "code"

# Sort by downloads
>>> hf datasets ls --sort downloads --limit 10
```

### Get dataset info

```bash
>>> hf datasets info HuggingFaceFW/fineweb
```

## hf spaces

Use `hf spaces` to list Spaces on the Hub and get detailed information about a specific Space.

### List Spaces

```bash
# List trending Spaces
>>> hf spaces ls

# Search for Spaces
>>> hf spaces ls --search "3d"

# Sort by likes
>>> hf spaces ls --sort likes --limit 10
```

### Get Space info

```bash
>>> hf spaces info enzostvs/deepsite
```

## hf papers

Use `hf papers` to list daily papers on the Hub.

### List papers

```bash
# List most recent daily papers
>>> hf papers ls

# List trending papers
>>> hf papers ls --sort=trending

# List papers from a specific date
>>> hf papers ls --date=2025-01-23

# List today's papers
>>> hf papers ls --date=today

# Limit results
>>> hf papers ls --sort=trending --limit=5
```

## hf repo

`hf repo` lets you create, delete, move repositories and update their settings on the Hugging Face Hub. It also includes subcommands to manage branches and tags.

### Create a repo

```bash
>>> hf repo create Wauplin/my-cool-model
Successfully created Wauplin/my-cool-model on the Hub.
Your repo is now available at https://huggingface.co/Wauplin/my-cool-model
```

Create a private dataset or a Space:

```bash
>>> hf repo create my-cool-dataset --repo-type dataset --private
>>> hf repo create my-gradio-space --repo-type space --space-sdk gradio
```

Use `--exist-ok` if the repo may already exist, and `--resource-group-id` to target an Enterprise resource group.

### Delete a repo

```bash
>>> hf repo delete Wauplin/my-cool-model
```

Datasets and Spaces:

```bash
>>> hf repo delete my-cool-dataset --repo-type dataset
>>> hf repo delete my-gradio-space --repo-type space
```

### Move a repo

```bash
>>> hf repo move old-namespace/my-model new-namespace/my-model
```

### Update repo settings

```bash
>>> hf repo settings Wauplin/my-cool-model --gated auto
>>> hf repo settings Wauplin/my-cool-model --private true
>>> hf repo settings Wauplin/my-cool-model --private false
```

- `--gated`: one of `auto`, `manual`, `false`
- `--private true|false`: set repository privacy

## hf repo branch

Use `hf repo branch` to create and delete branches for repositories on the Hub.

```bash
# Create a branch
>>> hf repo branch create Wauplin/my-cool-model dev

# Create a branch from a specific revision
>>> hf repo branch create Wauplin/my-cool-model release-1 --revision refs/pr/104

# Delete a branch
>>> hf repo branch delete Wauplin/my-cool-model dev
```

> [!TIP]
> All commands accept `--repo-type` (one of `model`, `dataset`, `space`) and `--token` if you need to authenticate explicitly. Use `--help` on any command to see all options.

## hf repo-files

If you want to delete files from a Hugging Face repository, use the `hf repo-files` command.

### Delete files

The `hf repo-files delete <repo_id>` sub-command allows you to delete files from a repository. Here are some usage examples.

Delete a folder :
```bash
>>> hf repo-files delete Wauplin/my-cool-model folder/
Files correctly deleted from repo. Commit: https://huggingface.co/Wauplin/my-cool-mo...
```

Delete multiple files:
```bash
>>> hf repo-files delete Wauplin/my-cool-model file.txt folder/pytorch_model.bin
Files correctly deleted from repo. Commit: https://huggingface.co/Wauplin/my-cool-mo...
```

Use wildcard patterns to delete sets of files. Patterns are Standard Wildcards (globbing patterns) as documented [here](https://tldp.org/LDP/GNU-Linux-Tools-Summary/html/x11655.htm). The pattern matching is based on [`fnmatch`](https://docs.python.org/3/library/fnmatch.html).

<Tip warning={true}>

Note that `fnmatch` matches `*` across path boundaries, unlike traditional Unix shell globbing. For example, `"data/*.json"` will match both `data/file.json` **and** `data/subdir/file.json`. To match only files in the immediate directory, you need to list them explicitly or use more specific patterns.

</Tip>

```bash
>>> hf repo-files delete Wauplin/my-cool-model "*.txt" "folder/*.bin"
Files correctly deleted from repo. Commit: https://huggingface.co/Wauplin/my-cool-mo...
```

### Specify a token

To delete files from a repo you must be authenticated and authorized. By default, the token saved locally (using `hf auth login`) will be used. If you want to authenticate explicitly, use the `--token` option:

```bash
>>> hf repo-files delete --token=hf_**** Wauplin/my-cool-model file.txt
```

## hf cache

Use `hf cache` to manage your local Hugging Face cache directory. The cache stores downloaded models, datasets, and other files from the Hub.

```bash
# List cached repositories
>>> hf cache ls

# List cached revisions
>>> hf cache ls --revisions

# Remove specific items from cache
>>> hf cache rm model/gpt2

# Remove unreferenced revisions
>>> hf cache prune

# Verify cached file checksums
>>> hf cache verify gpt2
```

## hf cache ls

Use `hf cache ls` to inspect what is stored locally in your Hugging Face cache. By default it aggregates information by repository:

```bash
>>> hf cache ls
ID                          SIZE     LAST_ACCESSED LAST_MODIFIED REFS        
--------------------------- -------- ------------- ------------- ----------- 
dataset/nyu-mll/glue          157.4M 2 days ago    2 days ago    main script 
model/LiquidAI/LFM2-VL-1.6B     3.2G 4 days ago    4 days ago    main        
model/microsoft/UserLM-8b      32.1G 4 days ago    4 days ago    main  

Found 3 repo(s) for a total of 5 revision(s) and 35.5G on disk.
```

Add `--revisions` to drill down to specific snapshots, and chain filters to focus on what matters:

```bash
>>> hf cache ls --filter "size>30g" --revisions
ID                        REVISION                                 SIZE     LAST_MODIFIED REFS 
------------------------- ---------------------------------------- -------- ------------- ---- 
model/microsoft/UserLM-8b be8f2069189bdf443e554c24e488ff3ff6952691    32.1G 4 days ago    main 

Found 1 repo(s) for a total of 1 revision(s) and 32.1G on disk.
```

The command supports several output formats for scripting: `--format json` prints structured objects, `--format csv` writes comma-separated rows, and `--quiet` prints only IDs. Use `--sort` to order entries by `accessed`, `modified`, `name`, or `size` (append `:asc` or `:desc` to control order), and `--limit` to restrict results to the top N entries. Combine these with `--cache-dir` to target alternative cache locations. See the [Manage your cache](./manage-cache) guide for advanced workflows.

Delete cache entries selected with `hf cache ls --q` by piping the IDs into `hf cache rm`:

```bash
>>> hf cache rm $(hf cache ls --filter "accessed>1y" -q) -y
About to delete 2 repo(s) totalling 5.31G.
  - model/meta-llama/Llama-3.2-1B-Instruct (entire repo)
  - model/hexgrad/Kokoro-82M (entire repo)
Delete repo: ~/.cache/huggingface/hub/models--meta-llama--Llama-3.2-1B-Instruct
Delete repo: ~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M
Cache deletion done. Saved 5.31G.
Deleted 2 repo(s) and 2 revision(s); freed 5.31G.
```

## hf cache rm

`hf cache rm` removes cached repositories or individual revisions. Pass one or more repo IDs (`model/bert-base-uncased`) or revision hashes:

```bash
>>> hf cache rm model/LiquidAI/LFM2-VL-1.6B
About to delete 1 repo(s) totalling 3.2G.
  - model/LiquidAI/LFM2-VL-1.6B (entire repo)
Proceed with deletion? [y/N]: y
Delete repo: ~/.cache/huggingface/hub/models--LiquidAI--LFM2-VL-1.6B
Cache deletion done. Saved 3.2G.
Deleted 1 repo(s) and 2 revision(s); freed 3.2G.
```

Mix repositories and specific revisions in the same call. Use `--dry-run` to preview the impact, or `--yes` to skip the confirmation prompt—handy in automated scripts:

```bash
>>> hf cache rm model/t5-small 8f3ad1c --dry-run
About to delete 1 repo(s) and 1 revision(s) totalling 1.1G.
  - model/t5-small:
      8f3ad1c [main] 1.1G
Dry run: no files were deleted.
```

When working outside the default cache location, pair the command with `--cache-dir PATH`.

## hf cache prune

`hf cache prune` is a convenience shortcut that deletes every detached (unreferenced) revision in your cache. This keeps only revisions that are still reachable through a branch or tag:

```bash
>>> hf cache prune
About to delete 3 unreferenced revision(s) (2.4G total).
  - model/t5-small:
      1c610f6b [refs/pr/1] 820.1M
      d4ec9b72 [(detached)] 640.5M
  - dataset/google/fleurs:
      2b91c8dd [(detached)] 937.6M
Proceed? [y/N]: y
Deleted 3 unreferenced revision(s); freed 2.4G.
```

As with the other cache commands, `--dry-run`, `--yes`, and `--cache-dir` are available. Refer to the [Manage your cache](./manage-cache) guide for more examples.

## hf cache verify

Use `hf cache verify` to validate local files against their checksums on the Hub. You can verify either a cache snapshot or a regular local directory.

Examples:

```bash
# Verify main revision of a model in cache
>>> hf cache verify deepseek-ai/DeepSeek-OCR

# Verify a specific revision
>>> hf cache verify deepseek-ai/DeepSeek-OCR --revision refs/pr/5
>>> hf cache verify deepseek-ai/DeepSeek-OCR --revision ef93bf4a377c5d5ed9dca78e0bc4ea50b26fe6a4

# Verify a private repo
>>> hf cache verify me/private-model --token hf_***

# Verify a dataset
>>> hf cache verify karpathy/fineweb-edu-100b-shuffle --repo-type dataset

# Verify files in a local directory
>>> hf cache verify deepseek-ai/DeepSeek-OCR --local-dir /path/to/repo
```

By default, the command warns about missing or extra files. Use flags to turn these warnings into errors:

```bash
>>> hf cache verify deepseek-ai/DeepSeek-OCR --fail-on-missing-files --fail-on-extra-files
```

On success, you will see a summary:

```text
✅ Verified 13 file(s) for 'deepseek-ai/DeepSeek-OCR' (model) in ~/.cache/huggingface/hub/models--meta-llama--Llama-3.2-1B-Instruct/snapshots/9213176726f574b556790deb65791e0c5aa438b6
  All checksums match.
```

If mismatches are detected, the command prints a detailed list and exits with a non-zero status.

## hf repo tag

Use `hf repo tag` to create, list, and delete tags for repositories on the Hub.

```bash
# Create a tag
>>> hf repo tag create my-model v1.0

# List tags
>>> hf repo tag list my-model

# Delete a tag
>>> hf repo tag delete my-model v1.0
```

### Tag a model

To tag a repo, you need to provide the `repo_id` and the `tag` name:

```bash
>>> hf repo tag create Wauplin/my-cool-model v1.0
You are about to create tag v1.0 on model Wauplin/my-cool-model
Tag v1.0 created on Wauplin/my-cool-model
```

### Tag a model at a specific revision

If you want to tag a specific revision, you can use the `--revision` option. By default, the tag will be created on the `main` branch:

```bash
>>> hf repo tag create Wauplin/my-cool-model v1.0 --revision refs/pr/104
You are about to create tag v1.0 on model Wauplin/my-cool-model
Tag v1.0 created on Wauplin/my-cool-model
```

### Tag a dataset or a Space

If you want to tag a dataset or Space, you must specify the `--repo-type` option:

```bash
>>> hf repo tag create bigcode/the-stack v1.0 --repo-type dataset
You are about to create tag v1.0 on dataset bigcode/the-stack
Tag v1.0 created on bigcode/the-stack
```

### List tags

To list all tags for a repository, use the `-l` or `--list` option:

```bash
>>> hf repo tag create Wauplin/gradio-space-ci -l --repo-type space
Tags for space Wauplin/gradio-space-ci:
0.2.2
0.2.1
0.2.0
0.1.2
0.0.2
0.0.1
```

### Delete a tag

To delete a tag, use the `-d` or `--delete` option:

```bash
>>> hf repo tag create -d Wauplin/my-cool-model v1.0
You are about to delete tag v1.0 on model Wauplin/my-cool-model
Proceed? [Y/n] y
Tag v1.0 deleted on Wauplin/my-cool-model
```

You can also pass `-y` to skip the confirmation step.

## hf env

The `hf env` command prints details about your machine setup. This is useful when you open an issue on [GitHub](https://github.com/huggingface/huggingface_hub) to help the maintainers investigate your problem.

```bash
>>> hf env

Copy-and-paste the text below in your GitHub issue.

- huggingface_hub version: 1.0.0.rc6
- Platform: Linux-6.8.0-85-generic-x86_64-with-glibc2.35
- Python version: 3.11.14
- Running in iPython ?: No
- Running in notebook ?: No
- Running in Google Colab ?: No
- Running in Google Colab Enterprise ?: No
- Token path ?: /home/wauplin/.cache/huggingface/token
- Has saved token ?: True
- Who am I ?: Wauplin
- Configured git credential helpers: store
- Installation method: unknown
- Torch: N/A
- httpx: 0.28.1
- hf_xet: 1.1.10
- gradio: 5.41.1
- tensorboard: N/A
- pydantic: 2.11.7
- ENDPOINT: https://huggingface.co
- HF_HUB_CACHE: /home/wauplin/.cache/huggingface/hub
- HF_ASSETS_CACHE: /home/wauplin/.cache/huggingface/assets
- HF_TOKEN_PATH: /home/wauplin/.cache/huggingface/token
- HF_STORED_TOKENS_PATH: /home/wauplin/.cache/huggingface/stored_tokens
- HF_HUB_OFFLINE: False
- HF_HUB_DISABLE_TELEMETRY: False
- HF_HUB_DISABLE_PROGRESS_BARS: None
- HF_HUB_DISABLE_SYMLINKS_WARNING: False
- HF_HUB_DISABLE_EXPERIMENTAL_WARNING: False
- HF_HUB_DISABLE_IMPLICIT_TOKEN: False
- HF_HUB_DISABLE_XET: False
- HF_HUB_ETAG_TIMEOUT: 10
- HF_HUB_DOWNLOAD_TIMEOUT: 10
```

## hf jobs

Run compute jobs on Hugging Face infrastructure with a familiar Docker-like interface.

`hf jobs` is a command-line tool that lets you run anything on Hugging Face's infrastructure (including GPUs and TPUs!) with simple commands. Think `docker run`, but for running code on A100s.

```bash
# Directly run Python code
>>> hf jobs run python:3.12 python -c 'print("Hello from the cloud!")'

# Use GPUs without any setup
>>> hf jobs run --flavor a10g-small pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel \
... python -c "import torch; print(torch.cuda.get_device_name())"

# Run in an organization account
>>> hf jobs run --namespace my-org-name python:3.12 python -c 'print("Running in an org account")'

# Run from Hugging Face Spaces
>>> hf jobs run hf.co/spaces/lhoestq/duckdb duckdb -c 'select "hello world"'

# Run a Python script with `uv` (experimental)
>>> hf jobs uv run my_script.py
```

### ✨ Key Features

- 🐳 **Docker-like CLI**: Familiar commands (`run`, `ps`, `logs`, `inspect`) to run and manage jobs
- 🔥 **Any Hardware**: From CPUs to A100 GPUs and TPU pods - switch with a simple flag
- 📦 **Run Anything**: Use Docker images, HF Spaces, or your custom containers
- 🔐 **Simple Auth**: Just use your HF token
- 📊 **Live Monitoring**: Stream logs in real-time, just like running locally
- 💰 **Pay-as-you-go**: Only pay for the seconds you use

> [!TIP]
> **Hugging Face Jobs** are available only to [Pro users](https://huggingface.co/pro) and [Team or Enterprise organizations](https://huggingface.co/enterprise). Upgrade your plan to get started!

### Quick Start

#### 1. Run your first job

```bash
# Run a simple Python script
>>> hf jobs run python:3.12 python -c 'print("Hello from HF compute!")'
```

This command runs the job and shows the logs. You can pass `--detach` to run the Job in the background and only print the Job ID.

#### 2. Check job status

```bash
# List your running jobs
>>> hf jobs ps
# List all jobs
>>> hf jobs ps -a

# Inspect the status of a job
>>> hf jobs inspect <job_id>

# View logs from a job
>>> hf jobs logs <job_id>

# View resources usage stats and metrics of running jobs
>>> hf jobs stats
# View resources usage stats and metrics of some jobs
>>> hf jobs stats [job_ids]...

# Cancel a job
>>> hf jobs cancel <job_id>
```

#### 3. Run on GPU

You can also run jobs on GPUs or TPUs with the `--flavor` option. For example, to run a PyTorch job on an A10G GPU:

```bash
# Use an A10G GPU to check PyTorch CUDA
>>> hf jobs run --flavor a10g-small pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel \
... python -c 'import torch; print(f"This code ran with the following GPU: {torch.cuda.get_device_name()}")'
```

Running this will show the following output!

```bash
This code ran with the following GPU: NVIDIA A10G
```

A `--` can be used to separate the command from jobs options for clarity, e.g., `hf jobs run --flavor a10g-small -- python -c '...'`

That's it! You're now running code on Hugging Face's infrastructure.

### Common Use Cases

- **Model Training**: Fine-tune or train models on GPUs (T4, A10G, A100) without managing infrastructure
- **Synthetic Data Generation**: Generate large-scale datasets using LLMs on powerful hardware
- **Data Processing**: Process massive datasets with high-CPU configurations for parallel workloads
- **Batch Inference**: Run offline inference on thousands of samples using optimized GPU setups
- **Experiments & Benchmarks**: Run ML experiments on consistent hardware for reproducible results
- **Development & Debugging**: Test GPU code without local CUDA setup

### Pass Environment variables and Secrets

You can pass environment variables to your job using 

```bash
# Pass environment variables
>>> hf jobs run -e FOO=foo -e BAR=bar python:3.12 python -c 'import os; print(os.environ["FOO"], os.environ["BAR"])'
```

```bash
# Pass an environment from a local .env file
>>> hf jobs run --env-file .env python:3.12 python -c 'import os; print(os.environ["FOO"], os.environ["BAR"])'
```

```bash
# Pass secrets - they will be encrypted server side
>>> hf jobs run -s MY_SECRET=psswrd python:3.12 python -c 'import os; print(os.environ["MY_SECRET"])'
```

```bash
# Pass secrets from a local .env.secrets file - they will be encrypted server side
>>> hf jobs run --secrets-file .env.secrets python:3.12 python -c 'import os; print(os.environ["MY_SECRET"])'
```

> [!TIP]
> Use `--secrets HF_TOKEN` to pass your local Hugging Face token implicitly.
> With this syntax, the secret is retrieved from the environment variable.
> For `HF_TOKEN`, it may read the token file located in the Hugging Face home folder if the environment variable is unset.

### Job Timeout

Jobs have a default timeout of 30 mins, after which they automatically stop. For long-running tasks like model training, set a custom timeout using the `--timeout` option:

```bash
# Set timeout in seconds (default unit)
>>> hf jobs run --timeout 7200 python:3.12 python train.py

# Use time units: s (seconds), m (minutes), h (hours), d (days)
>>> hf jobs run --timeout 2h pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel python train.py
>>> hf jobs run --timeout 90m python:3.12 python process_data.py
>>> hf jobs run --timeout 1.5h python:3.12 python train.py  # floats are supported
```

The `--timeout` option also works with UV scripts and scheduled jobs:

```bash
# UV script with timeout
>>> hf jobs uv run --timeout 2h training_script.py

# Scheduled job with timeout
>>> hf jobs scheduled run @daily --timeout 4h python:3.12 python daily_task.py
```

> [!WARNING]
> If your job exceeds the timeout, it will be automatically terminated. Always set an appropriate timeout with some buffer for long-running tasks to avoid unexpected job terminations.

### Hardware

Available `--flavor` options:

- CPU: `cpu-basic`, `cpu-upgrade`
- GPU: `t4-small`, `t4-medium`, `l4x1`, `l4x4`, `a10g-small`, `a10g-large`, `a10g-largex2`, `a10g-largex4`,`a100-large`
- TPU: `v5e-1x1`, `v5e-2x2`, `v5e-2x4`

(updated in 07/2025 from Hugging Face [suggested_hardware docs](https://huggingface.co/docs/hub/en/spaces-config-reference))

### Labels

Add labels to a Job using `-l` or `--label`. Labels are a key=value pairs that applies metadata to a Job. To label a Job with two labels, repeat the label flag (`-l` or `--label`):

```bash
>>> hf jobs run -l my-label --label foo=bar ubuntu echo "This Job has multiple labels"
```

The my-label key doesn't specify a value so its value defaults to an empty string ("").

Use `-f` or `--filter` in `hf jobs ps` to filter Jobs that match certain labels:

```bash
# Show fine-tuning Jobs
>>> hf jobs ps -a --filter label=fine-tuning

# Show Jobs that don't have the "prod" label and have a label that starts with "data-"
>>> hf jobs ps -a --filter label!=prod --filter "label=data-*"

# Show Jobs based on key=value labels
>>> hf jobs ps -a --filter label=model=Qwen3-06B --filter label=dataset!=Capybara
```

### UV Scripts (Experimental)

Run UV scripts (Python scripts with inline dependencies) on HF infrastructure. UV scripts are Python scripts that include their dependencies directly in the file using a special comment syntax.

```bash
# Run a UV script (creates temporary repo)
>>> hf jobs uv run my_script.py

# Run with persistent repo
>>> hf jobs uv run my_script.py --repo my-uv-scripts

# Run with GPU
>>> hf jobs uv run ml_training.py --flavor gpu-t4-small

# Pass arguments to script
>>> hf jobs uv run process.py input.csv output.parquet

# Add dependencies
>>> hf jobs uv run --with transformers --with torch train.py

# Run a script directly from a URL
>>> hf jobs uv run https://huggingface.co/datasets/username/scripts/resolve/main/example.py

# Run a command
>>> hf jobs uv run --with lighteval python -c 'import lighteval'
```

UV scripts are Python scripts that include their dependencies directly in the file using a special comment syntax. This makes them perfect for self-contained tasks that don't require complex project setups. Learn more about UV scripts in the [UV documentation](https://docs.astral.sh/uv/guides/scripts/).

A `--` can be used to separate the command from jobs/uv options for clarity, e.g., `hf jobs uv run --flavor gpu-t4-small --with torch -- python -c '...'`

## hf jobs scheduled

Schedule and manage jobs that will run on HF infrastructure.

The schedule should be one of `@annually`, `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`, or a CRON schedule expression (e.g., `"0 9 * * 1"` for 9 AM every Monday).

```bash
# Schedule a job that runs every hour
>>> hf jobs scheduled run @hourly python:3.12 python -c 'print("This runs every hour!")'

# Use the CRON syntax
>>> hf jobs scheduled run "*/5 * * * *" python:3.12 python -c 'print("This runs every 5 minutes!")'

# Schedule with GPU
>>> hf jobs scheduled run @hourly --flavor a10g-small pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel \
... python -c "import torch; print(f"This code ran with the following GPU: {torch.cuda.get_device_name()}")"

# Schedule a UV script
>>> hf jobs scheduled uv run @hourly my_script.py
```

Use the same parameters as `hf jobs run` to pass environment variables, secrets, timeout, etc.

Manage scheduled jobs using

```bash
# List your active scheduled jobs
>>> hf jobs scheduled ps

# Inspect the status of a job
>>> hf jobs scheduled inspect <scheduled_job_id>

# Suspend (pause) a scheduled job
>>> hf jobs scheduled suspend <scheduled_job_id>

# Resume a scheduled job
>>> hf jobs scheduled resume <scheduled_job_id>

# Delete a scheduled job
>>> hf jobs scheduled delete <scheduled_job_id>
```

## hf endpoints

Use `hf endpoints` to list, deploy, describe, and manage Inference Endpoints directly from the terminal. The legacy
`hf inference-endpoints` alias remains available for compatibility.

```bash
# Lists endpoints in your namespace
>>> hf endpoints ls

# Deploy an endpoint from Model Catalog
>>> hf endpoints catalog deploy --repo openai/gpt-oss-120b --name my-endpoint

# Deploy an endpoint from the Hugging Face Hub 
>>> hf endpoints deploy my-endpoint --repo gpt2 --framework pytorch --accelerator cpu --instance-size x2 --instance-type intel-icl

# List catalog entries
>>> hf endpoints catalog ls

# Show status and metadata
>>> hf endpoints describe my-endpoint

# Pause the endpoint
>>> hf endpoints pause my-endpoint

# Delete without confirmation prompt
>>> hf endpoints delete my-endpoint --yes
```

> [!TIP]
> Add `--namespace` to target an organization, `--token` to override authentication.

## hf endpoints catalog

Use `hf endpoints catalog` to interact with the Inference Endpoints Model Catalog. Deploy models directly from the catalog with optimized configurations.

```bash
# List available catalog models
>>> hf endpoints catalog ls

# Deploy a model from the catalog
>>> hf endpoints catalog deploy --repo meta-llama/Llama-3.2-1B-Instruct

# Deploy with a custom name
>>> hf endpoints catalog deploy --repo meta-llama/Llama-3.2-1B-Instruct --name my-llama-endpoint
```