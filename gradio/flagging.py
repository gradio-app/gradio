import gradio as gr
import os
import datetime
from gradio import encryptor
import csv
import io


class FlaggingHandler():
    """
    A class for defining the methods that any FlaggingHandler should have.
    """
    def __init__(self, app, **kwargs):
        """
        Parameters:
        app: Flask app running the interface (in gradio.networking)
        """
        self.app = app
        self.kwargs = kwargs

    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None, path=None):
        """
        This method should be overridden by the FlaggingHandler subclass.
        Parameters:
        input_data: The input data to be flagged.
        output_data: The output data to be flagged.
        flag_option (optional): In the case that flagging_options are provided, the flag option that is being used.
        flag_index (optional):
        username (optional): The username of the user that is flagging the data, if logged in.
        path (optional): The path to the logfile (if not the default path).
        """
        raise NotImplementedError("flag() method not implemented.")


class DefaultFlaggingHandler(FlaggingHandler):
    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None, flag_path=None):
        if flag_path is None:
            flag_path = os.path.join(self.app.cwd, self.app.interface.flagging_dir)
        log_fp = "{}/log.csv".format(flag_path)
        encryption_key = self.app.interface.encryption_key if self.app.interface.encrypt else None
        is_new = not os.path.exists(log_fp)

        if flag_index is None:
            csv_data = []
            for i, interface in enumerate(self.app.interface.input_components):
                csv_data.append(interface.save_flagged(
                    flag_path, self.app.interface.config["input_components"][i]["label"], input_data[i], encryption_key))
            for i, interface in enumerate(self.app.interface.output_components):
                csv_data.append(interface.save_flagged(
                    flag_path, self.app.interface.config["output_components"][i]["label"], output_data[i], encryption_key) if
                                output_data[i] is not None else "")
            if flag_option is not None:
                csv_data.append(flag_option)
            if username is not None:
                csv_data.append(username)
            csv_data.append(str(datetime.datetime.now()))
            if is_new:
                headers = [interface["label"]
                           for interface in self.app.interface.config["input_components"]]
                headers += [interface["label"]
                            for interface in self.app.interface.config["output_components"]]
                if self.app.interface.flagging_options is not None:
                    headers.append("flag")
                if username is not None:
                    headers.append("username")
                headers.append("timestamp")

        def replace_flag_at_index(file_content):
            file_content = io.StringIO(file_content)
            content = list(csv.reader(file_content))
            header = content[0]
            flag_col_index = header.index("flag")
            content[flag_index][flag_col_index] = flag_option
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerows(content)
            return output.getvalue()

        if self.app.interface.encrypt:
            output = io.StringIO()
            if not is_new:
                with open(log_fp, "rb") as csvfile:
                    encrypted_csv = csvfile.read()
                    decrypted_csv = encryptor.decrypt(
                        self.app.interface.encryption_key, encrypted_csv)
                    file_content = decrypted_csv.decode()
                    if flag_index is not None:
                        file_content = replace_flag_at_index(file_content)
                    output.write(file_content)
            writer = csv.writer(output)
            if flag_index is None:
                if is_new:
                    writer.writerow(headers)
                writer.writerow(csv_data)
            with open(log_fp, "wb") as csvfile:
                csvfile.write(encryptor.encrypt(
                    self.app.interface.encryption_key, output.getvalue().encode()))
        else:
            if flag_index is None:
                with open(log_fp, "a", newline="") as csvfile:
                    writer = csv.writer(csvfile)
                    if is_new:
                        writer.writerow(headers)
                    writer.writerow(csv_data)
            else:
                with open(log_fp) as csvfile:
                    file_content = csvfile.read()
                    file_content = replace_flag_at_index(file_content)
                with open(log_fp, "w", newline="") as csvfile:  # newline parameter needed for Windows
                    csvfile.write(file_content)
        with open(log_fp, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
        return line_count

# TODO(aliabd): in the Interface class, add a parameter called flagging_handler, which takes a subclass FlaggingHandler and instantiates with the interface object.
# If the interface is a Spaces demo, then it should use HuggingFaceFlaggingHandler, otherwise it should use DefaultFlaggingHandler.
# Also we should add a tooltip under the FLAG button that explains what will happen when they click on it (and a disclaimer saying that they should make sure no copyrighted material gets added to their dataset)
# Can you add a parameter called "flagging_disclaimer=" to Interface() and do the frontend?


class HuggingFaceFlaggingHandler(FlaggingHandler):
    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None, path=None):
        try:
            import huggingface_hub
        except (ImportError, ModuleNotFoundError):
            print("Package `huggingface_hub` not found. Please install it with 'pip install huggingface_hub'.")

        HF_TOKEN = os.environ.get("HF_TOKEN")
        dataset_repo_url = ""
        pass # TODO(abidlabs): implement this as follows
        # check if a repo exists with username/spacename (if path is None; otherwise, use path)
        # if not, create a repo with username/spacename
        # clone the repo and append to a log csv file
        repo = huggingface_hub.Repository(
            local_dir="data", clone_from=dataset_repo_url, use_auth_token=HF_TOKEN
        )
        dataset_file = ""
        # logic of writing to flagging log file            
        # push the repo 
        commit_url = repo.push_to_hub()
        # write tests
