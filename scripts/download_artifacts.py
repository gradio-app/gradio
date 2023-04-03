import argparse

import requests

WORKFLOW_RUN_ENDPOINT = "https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"
ARTIFACT_DOWNLOAD_ENDPOINT = "https://api.github.com/repos/{owner}/{repo}/actions/artifacts/{artifact_id}/zip"


def download_artifact(
    owner: str, repo: str, run_id: str, artifact_name: str, gh_token: str):
    """Download artifact by name from a run id
    Args:
        owner: Owner of the repo.
        repo: The name of the repository.
        run_id: The id of the action run that created the artifact.
        artifact_name: The name of the artifact to download.
        gh_token: The token used to download artifacts
    """

    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {gh_token}",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    artifacts = requests.get(
        WORKFLOW_RUN_ENDPOINT.format(owner=owner, repo=repo, run_id=run_id),
        headers=headers
    ).json()
    artifact_id = next((artifact['id'] for artifact in artifacts['artifacts'] if artifact['name'] == artifact_name), None)

    if not artifact_id:
        raise ValueError(f"Cannot find {artifact_name}! {artifacts} {owner} {repo} {run_id}")

    download = requests.get(
        ARTIFACT_DOWNLOAD_ENDPOINT.format(artifact_id=artifact_id, owner=owner, repo=repo,),
        headers=headers
    )
    with open(f"{artifact_name}.zip", "wb") as f:
        f.write(download.content)

    return f"{artifact_name}.zip"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download an artifact")
    parser.add_argument("run_id", type=str, help="Run id")
    parser.add_argument("artifact_name", type=str)
    parser.add_argument("gh_token", type=str)
    parser.add_argument("--owner", type=str, help="Owner of repository", default="gradio-app")
    parser.add_argument(
        "--repo", type=str, help="Name of repository", default="gradio"
    )
    args = parser.parse_args()
    new_space = download_artifact(
        args.owner, args.repo, args.run_id, args.artifact_name, args.gh_token)
    print(new_space)
