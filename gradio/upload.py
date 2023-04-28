import subprocess

def get_git_repo_directory():
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError:
        return None
    return output.decode("utf-8").strip()

def get_git_origins():
    try:
        output = subprocess.check_output(["git", "remote", "-v"], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError:
        return []
    output = output.decode("utf-8")
    origins = []
    for line in output.split("\n"):
        if line.strip():
            origins.append(line.split("\t")[1].split(" ")[0])
    return origins

def upload_to_spaces():
    git_repo_directory = get_git_repo_directory()
    