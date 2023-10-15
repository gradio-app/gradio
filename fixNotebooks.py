import os
import json

for (root,dirs,files) in os.walk('demo/', topdown=True):
  for i in files:
    if i.endswith('.ipynb'):
      with open(os.path.join(root,i),'a+',encoding='utf-8') as f:
        f.seek(0)
        a = f.read()
        x = json.loads(a)
        for j in x["cells"]:
          if "id" in j.keys():
            j["id"] = str(j["id"])
        f.truncate(0)
        json_obj=json.dumps(x)
        f.write(json_obj)
