"""Implements a FastAPI server to run the gradio interface."""

from __future__ import annotations
from fastapi import FastAPI, Form, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import inspect
import os
import posixpath
import pkg_resources
import secrets
import traceback
from typing import Callable, Any, List, Optional, Tuple, TYPE_CHECKING
import urllib
import uvicorn

from gradio import utils
from gradio.process_examples import load_from_cache, process_example


STATIC_TEMPLATE_LIB = pkg_resources.resource_filename("gradio", "templates/")
STATIC_PATH_LIB = pkg_resources.resource_filename(
    "gradio", "templates/frontend/static")
VERSION_FILE = pkg_resources.resource_filename("gradio", "version.txt")
with open(VERSION_FILE) as version_file:
    version = version_file.read()
GRADIO_STATIC_ROOT = "https://gradio.s3-us-west-2.amazonaws.com/{}/static/".format(version)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=STATIC_TEMPLATE_LIB)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)


###########
# Auth 
###########

def get_current_user(token: str = Depends(oauth2_scheme)) -> Optional[str]:
    if token in app.tokens:
        return app.tokens[token]


def is_authenticated(token: str = Depends(oauth2_scheme)) -> bool:
    return get_current_user(token) is not None     


@app.get('/token')
def get_token(token: str = Depends(oauth2_scheme)):
    return {"token": token}


@app.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username, password = form_data.username, form_data.password
    if ((not callable(app.auth) and username in app.auth 
        and app.auth[username] == password)
        or (callable(app.auth) and app.auth.__call__(username, password))):
        token = secrets.token_urlsafe(16)
        app.tokens[token] = username
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect credentials.")


###############
# Routes
###############


@app.head('/', response_class=HTMLResponse)
@app.get('/', response_class=HTMLResponse)
def main(request: Request, is_authenticated=Depends(is_authenticated)):
    print('app.tokens', app.tokens)
    print('is_authenticated', is_authenticated)
    print('token>>>', request.headers.get("Authorization", "missing"))
    if app.auth is None or is_authenticated:
        config = app.interface.config
    else:
        config = {"auth_required": True, 
                  "auth_message": app.interface.auth_message}
    
    return templates.TemplateResponse(
        "frontend/index.html", 
        {"request": request, "config": config}
    )


@app.get("/static/{path:path}")
def static_resource(path: str):
    # if app.interface.share:
        # return redirect(GRADIO_STATIC_ROOT + path)
    # else:
    static_file = safe_join(STATIC_PATH_LIB, path)
    if static_file is not None:
        return FileResponse(static_file)
    raise HTTPException(status_code=404, detail="Static file not found")


def get_config():
    # if app.interface.auth is None or current_user.is_authenticated:
    return app.interface.config
    # else:
        # return {"auth_required": True, "auth_message": app.interface.auth_message}


@app.get("/api/", response_class=HTMLResponse)
def api_docs(request: Request):
    inputs = [type(inp) for inp in app.interface.input_components]
    outputs = [type(out) for out in app.interface.output_components]
    input_types_doc, input_types = get_types(inputs, "input")
    output_types_doc, output_types = get_types(outputs, "output")
    input_names = [type(inp).__name__ for inp in app.interface.input_components]
    output_names = [type(out).__name__ for out in app.interface.output_components]
    if app.interface.examples is not None:
        sample_inputs = app.interface.examples[0]
    else:
        sample_inputs = [inp.generate_sample() for inp in app.interface.input_components]
    docs = {
        "inputs": input_names,
        "outputs": output_names,
        "len_inputs": len(inputs),
        "len_outputs": len(outputs),
        "inputs_lower": [name.lower() for name in input_names],
        "outputs_lower": [name.lower() for name in output_names],
        "input_types": input_types,
        "output_types": output_types,
        "input_types_doc": input_types_doc,
        "output_types_doc": output_types_doc,
        "sample_inputs": sample_inputs,
        "auth": app.interface.auth,
        "local_login_url": urllib.parse.urljoin(
            app.interface.local_url, "login"),
        "local_api_url": urllib.parse.urljoin(
            app.interface.local_url, "api/predict")
    }
    return templates.TemplateResponse(
        "api_docs.html", 
        {"request": request, **docs}
    )


@app.post("/api/predict/")
# @login_check
async def predict(request: Request, username:str = Depends(get_current_user)):
    body = await request.json()
    flag_index = None
    if body.get("example_id") != None:
        example_id = body["example_id"]
        if app.interface.cache_examples:
            prediction = load_from_cache(app.interface, example_id)
            durations = None
        else:
            prediction, durations = process_example(app.interface, example_id)
    else:
        raw_input = body["data"]
        if app.interface.show_error:
            try:
                prediction, durations = app.interface.process(raw_input)
            except BaseException as error:
                traceback.print_exc()
                return JSONResponse(content={"error": str(error)}, status_code=500)
        else:
            prediction, durations = app.interface.process(raw_input)
        if app.interface.allow_flagging == "auto":
            flag_index = app.interface.flagging_callback.flag(
                app.interface, raw_input, prediction,
                flag_option=(None if app.interface.flagging_options is None else ""), 
                username=username)
    output = {
        "data": prediction, 
        "durations": durations, 
        "avg_durations": app.interface.config.get("avg_durations"),
        "flag_index": flag_index
    }    
    return output


@app.post("/api/flag/")
#@login_check
async def flag(request: Request):
    if app.interface.analytics_enabled:
        utils.log_feature_analytics(app.interface.ip_address, 'flag')
    body = await request.json()
    data = body['data']
    app.interface.flagging_callback.flag(
        app.interface, data['input_data'], data['output_data'], 
        data.get("flag_option"), data.get("flag_index"),
        None)
        # current_user.id if current_user.is_authenticated else None)
    return {'success': True}


@app.post("/api/interpret/")
#@login_check
async def interpret(request: Request):
    if app.interface.analytics_enabled:
        utils.log_feature_analytics(app.interface.ip_address, 'interpret')
    body = await request.json()
    raw_input = body["data"]
    interpretation_scores, alternative_outputs = app.interface.interpret(
        raw_input)
    return {
        "interpretation_scores": interpretation_scores,
        "alternative_outputs": alternative_outputs
    }



# @app.route("/shutdown", methods=['GET'])
# def shutdown():
#     shutdown_func = request.environ.get('werkzeug.server.shutdown')
#     if shutdown_func is None:
#         raise RuntimeError('Not running werkzeug')
#     shutdown_func()
#     return "Shutting down..."


# @app.route("/api/queue/push/", methods=["POST"])
# #@login_check
# def queue_push():
#     data = request.json["data"]
#     action = request.json["action"]
#     job_hash, queue_position = queueing.push({"data": data}, action)
#     return {"hash": job_hash, "queue_position": queue_position}


# @app.route("/api/queue/status/", methods=["POST"])
# #@login_check
# def queue_status():
#     hash = request.json['hash']
#     status, data = queueing.get_status(hash)
#     return {"status": status, "data": data}


# def get_current_user(token: str = Depends(oauth2_scheme))

########
# Helper functions
########


def safe_join(directory: str, path: str) -> Optional[str]:
    """Safely path to a base directory to avoid escaping the base directory.
    Borrowed from: werkzeug.security.safe_join"""
    _os_alt_seps: List[str] = list(
        sep for sep in [os.path.sep, os.path.altsep] if sep is not None and sep != "/"
    )

    if path != "":
        filename = posixpath.normpath(path)

    if (
        any(sep in filename for sep in _os_alt_seps)
        or os.path.isabs(filename)
        or filename == ".."
        or filename.startswith("../")
    ):
        return None

    return posixpath.join(directory, filename)    


def get_types(cls_set, component):
    docset = []
    types = []
    if component == "input":
        for cls in cls_set:
            doc = inspect.getdoc(cls.preprocess)
            doc_lines = doc.split("\n")
            docset.append(doc_lines[1].split(":")[-1])
            types.append(doc_lines[1].split(")")[0].split("(")[-1])
    else:
        for cls in cls_set:
            doc = inspect.getdoc(cls.postprocess)
            doc_lines = doc.split("\n")
            docset.append(doc_lines[-1].split(":")[-1])
            types.append(doc_lines[-1].split(")")[0].split("(")[-1])
    return docset, types


def get_state():
    pass
    # return session.get("state")


def set_state(value):
    pass
#     session["state"] = value

    
if __name__ == '__main__': # Run directly for debugging: python app.py
    from gradio import Interface    
    app.interface = Interface(lambda x: "Hello, " + x, "text", "text",
                              analytics_enabled=False)
    app.interface.config = app.interface.get_config_file()
    app.interface.show_error = True
    app.interface.flagging_callback.setup(app.interface.flagging_dir)
    # app.auth = None
    app.interface.auth = ("a", "b")
    app.auth = {"a": "b"}
    app.interface.auth_message = None
    app.tokens = {}
    uvicorn.run(app)
