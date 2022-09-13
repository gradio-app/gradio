import argparse
import datetime
from typing import Optional

from huggingface_hub import HfApi


def delete_space(space_id: str, hf_token: str, api_client: Optional[HfApi] = None):
    api_client = api_client or HfApi()
    # api_client.delete_repo(repo_id=space_id, token=hf_token, repo_type="spaces")


def get_spaces_to_delete(
    n_days: int, org_name: str, api_client: Optional[HfApi] = None
):
    api_client = api_client or HfApi()
    spaces = api.list_spaces(author=org_name)
    spaces_to_delete = []
    for space in spaces:
        last_modified = api_client.space_info(space.id).lastModified
        age = (
            datetime.datetime.now()
            - datetime.datetime.fromisoformat(last_modified.rsplit(".", 1)[0])
        ).days
        if age > n_days:
            spaces_to_delete.append(space.id)
    return spaces_to_delete


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument(
        "n_days",
        type=int,
        help="Spaces older than n_days will be automatically deleted",
    )
    parser.add_argument(
        "org_name", type=str, help="Name of the author/org to search in"
    )
    parser.add_argument("hf_token", type=str, help="HF API token")
    args = parser.parse_args()
    api = HfApi()

    to_delete = get_spaces_to_delete(args.n_days, args.org_name)
    for space in to_delete[:2]:
        print(f"Deleting {space}")
        delete_space(space, args.hf_token, api_client=api)
