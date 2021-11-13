import gradio as gr
import os
import datetime
from gradio import encryptor
import csv
import io
from abc import ABC, abstractmethod


class FlaggingHandler(ABC):
    """
    An abstract class for defining the methods that any FlaggingHandler should have.
    """
    def __init__(self, **kwargs):
        """
        Parameters:
        kwargs: any arguments that should be passed to the constructor of the class.
        """
        self.kwargs = kwargs

    def update_kwargs(self, **kwargs):
        """
        Parameters:
        kwargs: any arguments that should be passed to the constructor of the class.
        """
        self.kwargs.update(kwargs)

    @abstractmethod
    def setup(self):
        """
        This method should be overridden and ensure that everything is set up correctly for flag().
        This method gets called once at the beginning of the Interface.launch() method.
        """
        pass

    @abstractmethod
    def flag(self, input_data, output_data, flag_option, flag_index, username):
        """
        This method should be overridden by the FlaggingHandler subclass and may contain optional additional arguments.
        This gets called every time the <flag> button is pressed.
        Parameters:
        input_data: The input data to be flagged.
        output_data: The output data to be flagged.        
        flag_option (optional): In the case that flagging_options are provided, the flag option that is being used.
        flag_index (optional): The index of the sample that is being flagged.
        username (optional): The username of the user that is flagging the data, if logged in.
        Returns:
        (int) The total number of samples that have been flagged.
        """
        pass


class SimpleCSVLogger(FlaggingHandler):
    """
    A simple example implementation of the FlaggingHandler abstract class provided for illustrative purposes
    """
    def setup(self):
        assert self.kwargs['interface'] is not None, "self.kwargs['interface'] must be defined before calling flag()"
        assert self.kwargs['flagging_dir'] is not None, "self.kwargs['flagging_dir'] must be defined before calling flag()"
        os.makedirs(self.kwargs['flagging_dir'], exist_ok=True)

    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None):
        interface = self.kwargs['interface']
        flagging_dir = self.kwargs['flagging_dir']
        log_filepath = "{}/log.csv".format(flagging_dir)
        is_new = not os.path.exists(log_filepath)

        csv_data = []
        for i, input in enumerate(interface.input_components):
            csv_data.append(input.save_flagged(
                flagging_dir, interface.config["input_components"][i]["label"], input_data[i], None))
        for i, output in enumerate(interface.output_components):
            csv_data.append(output.save_flagged(
                flagging_dir, interface.config["output_components"][i]["label"], output_data[i], None) if
                            output_data[i] is not None else "")
        
        with open(log_filepath, "a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            if is_new:
                headers = [interface["label"]
                            for interface in interface.config["input_components"]]
                headers += [interface["label"]
                            for interface in interface.config["output_components"]]
                writer.writerow(headers)
            writer.writerow(csv_data)
        
        with open(log_filepath, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
        return line_count


class CSVLogger(FlaggingHandler):
    """
    The default implementation of the FlaggingHandler abstract class. Logs the input and output data to a CSV file.
    """
    def setup(self):
        assert self.kwargs['interface'] is not None, "self.kwargs['interface'] must be defined before calling flag()"
        assert self.kwargs['flagging_dir'] is not None, "self.kwargs['flagging_dir'] must be defined before calling flag()"
        os.makedirs(self.kwargs['flagging_dir'], exist_ok=True)

    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None):
        interface = self.kwargs['interface']
        flagging_dir = self.kwargs['flagging_dir']

        log_fp = "{}/log.csv".format(flagging_dir)
        encryption_key = interface.encryption_key if interface.encrypt else None
        is_new = not os.path.exists(log_fp)

        if flag_index is None:
            csv_data = []
            for i, input in enumerate(interface.input_components):
                csv_data.append(input.save_flagged(
                    flagging_dir, interface.config["input_components"][i]["label"], input_data[i], encryption_key))
            for i, output in enumerate(interface.output_components):
                csv_data.append(output.save_flagged(
                    flagging_dir, interface.config["output_components"][i]["label"], output_data[i], encryption_key) if
                                output_data[i] is not None else "")
            if flag_option is not None:
                csv_data.append(flag_option)
            if username is not None:
                csv_data.append(username)
            csv_data.append(str(datetime.datetime.now()))
            if is_new:
                headers = [interface["label"]
                           for interface in interface.config["input_components"]]
                headers += [interface["label"]
                            for interface in interface.config["output_components"]]
                if interface.flagging_options is not None:
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

        if interface.encrypt:
            output = io.StringIO()
            if not is_new:
                with open(log_fp, "rb") as csvfile:
                    encrypted_csv = csvfile.read()
                    decrypted_csv = encryptor.decrypt(
                        interface.encryption_key, encrypted_csv)
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
                    interface.encryption_key, output.getvalue().encode()))
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


class HuggingFaceDatasetSaver(FlaggingHandler):
    """
    An alternative implementation of the FlaggingHandler abstract class that saves the data to a HuggingFace dataset.
    """
    def __init__(self, hf_foken, dataset_name):
        super().__init__(hf_foken=hf_foken, dataset_name=dataset_name)
    
    def setup(self):
        try:
            import huggingface_hub 
        except (ImportError, ModuleNotFoundError):
            print("Package `huggingface_hub` not found is needed for HuggingFaceDatasetSaver. Try 'pip install huggingface_hub'.")
        assert self.kwargs['hf_token'] is not None, "self.kwargs['hf_token'] needed before calling flag()"
        assert self.kwargs['dataset_name'] is not None, "self.kwargs['dataset_name'] needed before calling flag()"


    def flag(self, input_data, output_data, flag_option=None, flag_index=None, username=None, path=None):
        # import huggingface_hub
        # dataset_repo_url = ""
        # pass # TODO(abidlabs): implement this as follows
        # # check if a repo exists with username/spacename (if path is None; otherwise, use path)
        # # if not, create a repo with username/spacename
        # # clone the repo and append to a log csv file
        # repo = huggingface_hub.Repository(
        #     local_dir="data", clone_from=dataset_repo_url, use_auth_token=HF_TOKEN
        # )
        # dataset_file = ""
        # # logic of writing to flagging log file            
        # # push the repo 
        # commit_url = repo.push_to_hub()
        # # write tests
        pass
