import libsql_client as libsql
import os
from openai import OpenAI
import numpy as np
from chunking import TextChunker
from tqdm import tqdm
import requests 
import voyageai

# vo = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"),)
url = os.getenv("TURSO_DATABASE_URL")
auth_token = os.getenv("TURSO_AUTH_TOKEN")
db_client = libsql.create_client_sync(url, auth_token=auth_token)

# openai_deepinfra = OpenAI(
#     api_key=os.getenv("DEEPINFRA_API_TOKEN"),
#     base_url="https://api.deepinfra.com/v1/openai"
# )


# def embed_and_upload(title, _type, url, contents):
#     documents_embeddings = vo.embed(contents, model="voyage-3", input_type="document").embeddings
    
#     values = [
#         (title, _type, url, content, np.array(embedding, dtype=np.float32))
#         for content, embedding in zip(contents, documents_embeddings)
#     ]
    
#     placeholders = ','.join(['(?, ?, ?, ?, ?)'] * len(contents))
    
#     flattened_values = [item for tup in values for item in tup]
    
#     db_client.execute(
#         f"INSERT INTO EMBEDDINGS (title, type, url, content, embedding) VALUES {placeholders}", 
#         flattened_values
#     )
#     return

# url = "http://localhost:5174/search-api"
# response = requests.get(url)
# data = response.json()

# guides = [d for d in data if d["type"] == "GUIDE"]
# docs = [d for d in data if d["type"] == "DOCS"]

# chunker = TextChunker()

# DOCS_AND_GUIDES_DESCRIPTION_SYSTEM_PROMPT = """
# You are a helpful assistant that summarizes pages in the Gradio website in only one sentence.
# You are given a page that is either a guide or docs. Both will consist of natural language mixed with python code.
# Your summaries will be used for embedding search that points to the page, so please be concise, accurate and include the most important parts. But it can only be one sentence.
# Your sentence should clarify what type of questions the page answers.
# Do not include 'gr.' before the function or class name. Do not ever use backticks or special code formatting in your response. For example write Interface instead of `Interface`.
# """

# def describe_page(content: str):
#     description = openai_deepinfra.chat.completions.create(
#         model="Qwen/Qwen2.5-72B-Instruct",
#         messages=[
#             {"role": "system", "content": DOCS_AND_GUIDES_DESCRIPTION_SYSTEM_PROMPT},
#             {"role": "user", "content": content}
#             ],
#     )

#     description = description.choices[0].message.content

#     return description

# for guide in tqdm(guides[1:]): # ignore weird 
#     description = describe_page(guide["content"])
#     chunks = chunker.chunk_page(guide["title"], guide["slug"], description, guide["type"])
#     try:
#         embed_and_upload(chunks.title, chunks.type, chunks.url, chunks.content)
#     except Exception as e:
#         print(e)
#         db_client.close()
#         1/0

# for page in tqdm(docs):
#     description = describe_page(guide["content"])
#     chunks = chunker.chunk_page(guide["title"], guide["slug"], description, guide["type"])
#     try:
#         embed_and_upload(chunks.title, chunks.type, chunks.url, chunks.content)
#     except Exception as e:
#         print(e)
#         db_client.close()
#         1/0


# demo_descriptions = []
# def get_demo_descriptions():
#     results = db_client.execute(
#         """
#         SELECT 
#             MIN(id) as id,
#             title,
#             type,
#             url,
#             STRING_AGG(content, ' ') as combined_content
#         FROM EMBEDDINGS_LLM_250
#         WHERE type = 'DEMO'
#         GROUP BY title, type, url;
#         """
#     )
#     for result in results:
#         demo_descriptions.append(
#             {
#                 "title": result["title"],
#                 "url": result["url"],
#                 "content": result["combined_content"]
#             }
#         )
#     return

# get_demo_descriptions()

# for demo in tqdm(demo_descriptions):
#     chunks = chunker.chunk_page(demo["title"], demo["url"], demo["content"], "DEMO")
#     try:
#         embed_and_upload(chunks.title, chunks.type, chunks.url, chunks.content)
#     except Exception as e:
#         print(e)
#         db_client.close()
#         1/0

demo_to_reqs = {}
for demo in os.listdir("demo"):
    if os.path.exists(os.path.join("demo", demo, "requirements.txt")):
        with open(os.path.join("demo", demo, "requirements.txt"), "r") as f:
            reqs = f.read()
            reqs = reqs.split("\n")
            demo_to_reqs[demo] = reqs

for title, requirements in tqdm(demo_to_reqs.items()):
    db_client.execute(
        """UPDATE EMBEDDINGS 
        SET requirements = ?
        WHERE type = 'DEMO' AND title = ?
        """, 
        (requirements, title.replace("_", " ").capitalize())
    )
    print(title.replace("_", " ").capitalize())

# demo_to_reqs = {}
# for demo in os.listdir("demo"):
#     if os.path.exists(os.path.join("demo", demo, "requirements.txt")):
#         with open(os.path.join("demo", demo, "requirements.txt"), "r") as f:
#             demo_to_reqs[demo] = f.read()

# for title, requirements in tqdm(demo_to_reqs.items()):
#     db_client.execute(
#         """UPDATE EMBEDDINGS 
#         SET requirements = ?
#         WHERE type = 'DEMO' AND title = ?
#         """, 
#         (requirements, title.replace("_", " ").capitalize())
#     )
#     print(title.replace("_", " ").capitalize())


db_client.close()
