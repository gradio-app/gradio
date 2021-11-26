import os
import pydrive
from pydrive.auth import GoogleAuth

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
with open(".env", "w") as env_file:
    env_file.write(f"GOOGLE_CLIENT_SECRETS='{client_secrets}'\n")
    env_file.write(f"GOOGLE_CLIENT_CREDENTIALS='{google_credentials}'")
