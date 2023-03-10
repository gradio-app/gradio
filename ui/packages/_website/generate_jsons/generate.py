from src import demos, guides, docs, changelog
import os 

demos.generate("../src/routes/demos/demos.json")
guides.generate("../src/routes/guides/guides.json")
docs.generate("../src/routes/docs/docs.json")
changelog.generate("../src/routes/changelog/changelog.json")    