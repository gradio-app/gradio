import json
import os
import re
from subprocess import run
import boto3, pathlib
from botocore import UNSIGNED
from botocore.config import Config
from concurrent.futures import ThreadPoolExecutor, as_completed
from src import changelog, demos, docs, guides

WEBSITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GRADIO_DIR = os.path.abspath(os.path.join(WEBSITE_DIR, "..", "..", "gradio"))
ROOT_DIR = os.path.abspath(os.path.join(WEBSITE_DIR, "..", ".."))
CHANGELOG = os.path.abspath(os.path.join(WEBSITE_DIR, "..", "..", "CHANGELOG.md"))


def make_dir(root, path):
    return os.path.abspath(os.path.join(root, path))

MAX_WORKERS = 16

def download_from_s3(bucket_name: str, s3_folder: str, local_dir: str):
    print(f"Downloading {bucket_name}/{s3_folder} → {local_dir}")
    s3 = boto3.client("s3", config=Config(signature_version=UNSIGNED))
    paginator = s3.get_paginator("list_objects_v2")

    def _one(key: str):
        if key.endswith("/"):
            return
        local_path = (
            pathlib.Path(local_dir) /
            pathlib.Path(os.path.relpath(key, s3_folder))
        )
        local_path.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file(bucket_name, key, str(local_path))

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = []
        for page in paginator.paginate(Bucket=bucket_name, Prefix=s3_folder):
            for obj in page.get("Contents", []):
                futures.append(pool.submit(_one, obj["Key"]))

        for f in as_completed(futures):
            f.result()

    print(f"✔ Done: {bucket_name}/{s3_folder}")


def convert_to_pypi_prerelease(version: str) -> str:
    def replacement(match):
        v, tag, tag_version = match.groups()
        if tag == "beta":
            return f"{v}b{tag_version}"
        elif tag == "alpha":
            return f"{v}a{tag_version}"
        else:
            return version

    return re.sub(r"(\d+\.\d+\.\d+)-([-a-z]+)\.(\d+)", replacement, version)


def get_all_5_x_versions():
    from packaging.version import Version, InvalidVersion
    import sys
    with open(CHANGELOG, "r") as f:
        VERSION_RE = re.compile(
            r'^##\s+(5\.\d+\.\d+)(?:-(?!beta)[0-9A-Za-z.-]+)?\s*$',
            re.MULTILINE,
        )
        versions = VERSION_RE.findall(f.read())
        uniq: set[str] = set(versions)
        try:
            return sorted(uniq, key=Version, reverse=True)
        except InvalidVersion as err:            
            print(f"Warning: {err}", file=sys.stderr)
        return sorted(uniq, reverse=True)



def get_versions():
    with open(make_dir(ROOT_DIR, "client/js/package.json")) as f:
        js_client_version = json.load(f)["version"]
    with open(make_dir(GRADIO_DIR, "package.json")) as f:
        version = convert_to_pypi_prerelease(json.load(f)["version"])
        with open(make_dir(WEBSITE_DIR, "src/lib/json/version.json"), "w+") as j:
            json.dump({"version": version}, j)
        with open(make_dir(WEBSITE_DIR, "src/lib/json/wheel.json"), "w+") as j:
            sha = (
                run(["git", "log", "-1", "--format='%H'"], capture_output=True)
                .stdout.decode("utf-8")
                .strip("'\n")
            )
            json.dump(
                {
                    "gradio_install": f"pip install https://gradio-builds.s3.amazonaws.com/{sha}/gradio-{version}-py3-none-any.whl",
                    "gradio_py_client_install": f"pip install 'gradio-client @ git+https://github.com/gradio-app/gradio@{sha}#subdirectory=client/python'",
                    "gradio_js_client_install": f"npm install https://gradio-builds.s3.amazonaws.com/{sha}/gradio-client-{js_client_version}.tgz",
                    "gradio_lite_url": f"https://gradio-lite-previews.s3.amazonaws.com/{sha}",
                },
                j,
            )

        past_versions = get_all_5_x_versions()
        with open(make_dir(WEBSITE_DIR, "src/lib/json/past_versions.json"), "w+") as j:
            json.dump({"past_versions": past_versions}, j)

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = []
            for v in past_versions:
                target = make_dir(WEBSITE_DIR, f"src/lib/templates_{v.replace('.', '-')}")
                if not os.path.exists(target):
                    futures.append(pool.submit(
                        download_from_s3,
                        "gradio-docs-json", f"{v}/templates/", target
                    ))

            target_4 = make_dir(WEBSITE_DIR, "src/lib/templates_4-44-1")
            if not os.path.exists(target_4):
                futures.append(pool.submit(
                    download_from_s3,
                    "gradio-docs-json", "4.44.1/templates/", target_4
                ))

            for f in as_completed(futures):
                f.result()
        print(f"\n\n✔ All Done\n\n")



def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)


create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json"))
create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json/guides"))

demos.generate(make_dir(WEBSITE_DIR, "src/lib/json/demos.json"))
guides.generate(make_dir(WEBSITE_DIR, "src/lib/json/guides/") + "/")
SYSTEM_PROMPT, FALLBACK_PROMPT = docs.generate(make_dir(WEBSITE_DIR, "src/lib/json/docs.json"))
_, _ = docs.generate(make_dir(WEBSITE_DIR, "src/lib/templates/docs.json"))
changelog.generate(make_dir(WEBSITE_DIR, "src/lib/json/changelog.json"))
get_versions()

# print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
# print(SYSTEM_PROMPT)
# print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")


with open(make_dir(WEBSITE_DIR, "src/lib/json/system_prompt.json"), "w+") as f:
    json.dump(
        {
            "SYSTEM": SYSTEM_PROMPT,
            "FALLBACK": FALLBACK_PROMPT,
        },
        f,
    )

print("JSON generated! " + make_dir(WEBSITE_DIR, "src/lib/json/"))
