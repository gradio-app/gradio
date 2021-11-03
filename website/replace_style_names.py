import json
import os

with open("generated/manifest.json") as manifest:
    style_map = json.load(manifest)

for root, _, files in os.walk("generated"):
    for file in files:
        if file.endswith(".html"):
            with open(os.path.join(root, file)) as old_file:
                content = old_file.read()
            for old_name, new_name in style_map.items():
                content = content.replace(old_name, new_name)
            with open(os.path.join(root, file), "w") as new_file:
                new_file.write(content)
