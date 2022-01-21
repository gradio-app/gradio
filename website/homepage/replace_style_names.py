import json
import os

with open("generated/manifest.json") as manifest:
    style_map = json.load(manifest)

for folder in ("generated", "dist"):
    for root, _, files in os.walk(folder):
        for file in files:
            if file.endswith(".html"):
                with open(os.path.join(root, file), encoding="utf-8") as old_file:
                    content = old_file.read()
                for old_name, new_name in style_map.items():
                    content = content.replace(old_name, new_name)
                with open(os.path.join(root, file), "w", encoding="utf-8") as new_file:
                    new_file.write(content)
            elif (
                file.startswith("style.")
                and file.endswith(".css")
                and file not in list(style_map.values())
            ):
                os.remove(os.path.join(root, file))
