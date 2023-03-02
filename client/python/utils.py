import requests


def space_name_to_src(space_name, access_token=None):
    headers = {} if access_token is None else {"Authorization": "Bearer {api_key}"}
    return (
        requests.get(
            f"https://huggingface.co/api/spaces/{space_name}/host", headers=headers
        )
        .json()
        .get("host")
    )
