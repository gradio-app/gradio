import gradio as gr
import os 


class FlaggingHandler():
    """
    A class for defining the methods that any FlaggingHandler should have.
    """
    def __init__(self, interface, **kwargs):
        """
        Parameters:
        interface (gradio.Interface): The interface object that is calling the flag method.
        """
        self.interface = interface
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
    def flag():
        pass
        # TODO(aliabd): bring the code from networking.flag() here and tweak it so it works.

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

