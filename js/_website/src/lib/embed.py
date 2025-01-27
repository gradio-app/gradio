# from openai import OpenAI
import libsql_client as libsql
import os
# import numpy as np
# from chunking import chunk_page
# from tqdm import tqdm
# import requests 

# oai_client = OpenAI()
# openai_deepinfra = OpenAI(
#     api_key=os.getenv("DEEPINFRA_API_TOKEN"),
#     base_url="https://api.deepinfra.com/v1/openai"
# )
url = os.getenv("TURSO_DATABASE_URL")
auth_token = os.getenv("TURSO_AUTH_TOKEN")


db_client = libsql.create_client_sync(url, auth_token=auth_token)


# def embed_and_upload(title, type, url, content):

#     response = oai_client.embeddings.create(
#         input=content,
#         model="text-embedding-3-small"
#     )
#     embedding = np.array(response.data[0].embedding, dtype=np.float32)
    # db_client.execute("INSERT INTO EMBEDDINGS_LLM_250 (title, type, url, content, embedding) VALUES (?, ?, ?, ?, ?)", 
    #                 (title, type, url, content, embedding))
#     db_client.execute("INSERT INTO EMBEDDINGS_250 (title, type, url, content, embedding) VALUES (?, ?, ?, ?, ?)", 
#                     (title, type, url, content, embedding))

#     return 

# # url = "https://www.gradio.app/search-api"
# # response = requests.get(url)
# # data = response.json()

# # guides = [d for d in data if d["type"] == "GUIDE"]
# # docs = [d for d in data if d["type"] == "DOCS"]

# # for guide in tqdm(guides):
# #     chunks = chunk_page(guide["title"], guide["slug"], guide["content"], guide["type"], 250)
# #     for chunk in tqdm(chunks):
# #         try:
# #             embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0

# # for page in tqdm(docs[49:]):
# #     chunks = chunk_page(page["title"], page["slug"], page["content"], page["type"], 250)
# #     for chunk in tqdm(chunks):
# #         try:
# #             embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0

# DOCS_AND_GUIDES_DESCRIPTION_SYSTEM_PROMPT = """
# You are a helpful assistant that summarizes pages in the Gradio website in only one sentence.
# You are given a page that is either a guide or docs. Both will consist of natural language mixed with python code.
# Your summaries will be used for embedding search that points to the page, so please be concise, accurate and include the most important parts. But it can only be one sentence.
# Your sentence should clarify what type of questions the page answers.
# Do not include 'gr.' before the function or class name. Do not ever use backticks or special code formatting in your response. For example write Interface instead of `Interface`.
# """

# # def describe_demo(demo_dir: str):
# #     with open(f"{demo_dir}/run.py", "r") as f:
# #         content = f.read()
# #     content = "TITLE: " + demo_dir.replace("_", " ") + "\n\n" + "CODE: \n\n" + content
# #     description = openai_deepinfra.chat.completions.create(
# #         model="Qwen/Qwen2.5-72B-Instruct",
# #         messages=[
# #             {"role": "system", "content": DEMO_DESCRIPTION_SYSTEM_PROMPT},
# #             {"role": "user", "content": content}
# #             ],
# #     )

# #     description = description.choices[0].message.content

# #     with open(f"{demo_dir}/description.txt", "w+") as f:
# #         f.write(description)
# #     return 

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

# url = "https://www.gradio.app/search-api"
# response = requests.get(url)
# data = response.json()

# guides = [d for d in data if d["type"] == "GUIDE"]
# docs = [d for d in data if d["type"] == "DOCS"]

# for guide in tqdm(guides):
#     description = describe_page(guide["content"])
#     try:
#         embed_and_upload(guide["title"], guide["type"], guide["slug"], description)
#     except Exception as e:
#         print(e)
#         db_client.close()
#         1/0

# for page in tqdm(docs):
#     description = describe_page(page["content"])
#     try:
#         embed_and_upload(page["title"], page["type"], page["slug"], description)
#     except Exception as e:
#         print(e)
#         db_client.close()
#         1/0

# # for guide in tqdm(guides):
# #     description = describe_page(guide["content"])
# #     chunks = chunk_page(guide["title"], guide["slug"], description, guide["type"], 250)
# #     for chunk in tqdm(chunks):
# #         try:
# #             embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0

# # for page in tqdm(docs):
# #     description = describe_page(page["content"])
# #     chunks = chunk_page(page["title"], page["slug"], description, page["type"], 250)
# #     for chunk in tqdm(chunks):
# #         try:
# #             embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0

# # for guide in tqdm(guides):
# #     description = describe_page(guide["content"])
# #     chunks = chunk_page(guide["title"], guide["slug"], description, guide["type"], 250)
# #     for chunk in tqdm(chunks):
# #         try:
# #             embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0
# # for guide in tqdm(guides):
# #     try:
# #         embed_and_upload(guide["title"], guide["type"], guide["slug"], guide["title"])
# #     except Exception as e:
# #         print(e)
# #         db_client.close()
# #         1/0


# # for page in tqdm(docs):
# #     try:
# #         embed_and_upload(page["title"], page["type"], page["slug"], page["title"])
# #     except Exception as e:
# #         print(e)
# #         db_client.close()
# #         1/0

# # for demo in tqdm(os.listdir("../../../../demo")[5:]):
# #     if os.path.exists(f"../../../../demo/{demo}/description.txt"):
# #         with open(f"../../../../demo/{demo}/run.py", "r") as f:
# #             code = f.read()
# #         try:
# #             embed_and_upload(demo.replace("_", " ").capitalize(), "DEMO", code, demo.replace("_", " ").replace("-", " "))
# #         except Exception as e:
# #             print(e)
# #             db_client.close()
# #             1/0

# # for demo in tqdm(os.listdir("../../../../demo")[5:]):
# #     if os.path.exists(f"../../../../demo/{demo}/description.txt"):
#         # with open(f"../../../../demo/{demo}/description.txt", "r") as f:
#         #     description = f.read()
#         # with open(f"../../../../demo/{demo}/run.py", "r") as f:
#         #     code = f.read()
#         # chunks = chunk_page(
#         #     title=demo.replace("_", " ").capitalize(),
#         #     url=code,
#         #     content=description,
#         #     type="DEMO",
#         #     target_length=250
#         # )
#         # for chunk in tqdm(chunks):
#             # try:
#             #     embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
#             # except Exception as e:
#             #     print(e)
#             #     db_client.close()
#             #     1/0

 


# # for demo in tqdm(os.listdir("../../../../demo")):
# #     if os.path.exists(f"../../../../demo/{demo}/run.py"):
# #         describe_demo(f"../../../../demo/{demo}")
# #         print(f"Finished {demo}")

# # for demo in tqdm(os.listdir("../../../../demo")):
# #     if os.path.exists(f"../../../../demo/{demo}/description.txt"):
# #         with open(f"../../../../demo/{demo}/description.txt", "r") as f:
# #             description = f.read()
# #         with open(f"../../../../demo/{demo}/run.py", "r") as f:
# #             code = f.read()
# #         chunks = chunk_page(
# #             title=demo.replace("_", " ").capitalize(),
# #             url=code,
# #             content=description,
# #             type="DEMO",
# #             target_length=250
# #         )
# #         for chunk in tqdm(chunks):
# #             try:
# #                 embed_and_upload(chunk.title, chunk.type, chunk.url, chunk.content)
# #             except Exception as e:
# #                 print(e)
# #                 db_client.close()
# #                 1/0

# #         print(f"Finished {demo}") 
 

samples = db_client.execute("SELECT id, prompt, existing_code, response, requirements FROM PROMPTS WHERE id IN (26578, 26486, 26615, 257282, 25547, 25507, 25251, 25217, 25157, 25114, 25109, 25091)")
db_client.close()

columns = ["id", "prompt", "existing_code", "response", "requirements"]
samples = [{columns[i]: sample[i] for i in range(len(columns))} for sample in samples.rows]


for sample in samples:
    for key in sample:
        print(key)
        print("="*20)
        print(sample[key])
        print("="*200)
        print("\n\n")