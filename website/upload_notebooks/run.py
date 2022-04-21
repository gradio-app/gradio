import json
import os

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

gauth = GoogleAuth()
if os.path.exists("google_credentials.json"):
    gauth.LoadCredentialsFile("google_credentials.json")
if gauth.credentials is None:
    gauth.LocalWebserverAuth()
elif gauth.access_token_expired:
    gauth.Refresh()
else:
    gauth.Authorize()
gauth.SaveCredentialsFile("google_credentials.json")

with open("client_secrets.json") as client_secrets_file:
    client_secrets = client_secrets_file.read()
with open("google_credentials.json") as google_credentials_file:
    google_credentials = google_credentials_file.read()

GRADIO_DEMO_DIR = "../../demo/"
NOTEBOOK_TYPE = "application/vnd.google.colaboratory"
GOOGLE_FOLDER_TYPE = "application/vnd.google-apps.folder"


def run():
    drive = GoogleDrive(gauth)

    demo_links = {}
    with open("colab_template.ipynb") as notebook_template_file:
        notebook_template = notebook_template_file.read()
    file_list = drive.ListFile(
        {
            "q": f"title='Demos' and mimeType='{GOOGLE_FOLDER_TYPE}' and 'root' in parents and trashed=false"
        }
    ).GetList()
    if len(file_list) > 0:
        demo_folder = file_list[0].metadata["id"]
    else:
        demo_folder_file = drive.CreateFile(
            {"title": "Demos", "mimeType": GOOGLE_FOLDER_TYPE}
        )
        demo_folder_file.Upload()
        demo_folder = demo_folder_file.metadata["id"]
    for demo_name in [demo_dir for demo_dir in os.listdir(GRADIO_DEMO_DIR)
                      if os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo_dir))]:
        notebook_title = demo_name + ".ipynb"
        print("--- " + demo_name + " ---")
        with open(os.path.join(GRADIO_DEMO_DIR, demo_name, "run.py")) as demo_file:
            demo_content = demo_file.read()
            demo_content = demo_content.replace(
                'if __name__ == "__main__":\n    iface.launch()', "iface.launch()"
            )
            lines = demo_content.split("/n")
            demo_content = [
                line + "\n" if i != len(lines) - 1 else line
                for i, line in enumerate(lines)
            ]
        notebook = json.loads(notebook_template)
        notebook["cells"][1]["source"] = demo_content
        file_list = drive.ListFile(
            {
                "q": f"title='{notebook_title}' and mimeType='{NOTEBOOK_TYPE}' and 'root' in parents and trashed=false"
            }
        ).GetList()
        if len(file_list) > 0:
            drive_file = file_list[0]
        else:
            drive_file = drive.CreateFile(
                {
                    "title": notebook_title,
                    "mimeType": NOTEBOOK_TYPE,
                    "parents": [{"id": demo_folder}],
                }
            )
        drive_file.SetContentString(json.dumps(notebook))
        drive_file.Upload()
        drive_file.InsertPermission(
            {"type": "anyone", "value": "anyone", "role": "reader"}
        )
        demo_links[demo_name] = drive_file["alternateLink"]
    with open("../.env", "w") as env_file:
        env_file.write(f"COLAB_NOTEBOOK_LINKS='{json.dumps(demo_links)}'")


if __name__ == "__main__":
    run()
