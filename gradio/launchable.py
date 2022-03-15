from __future__ import annotations

import getpass
import os
import sys
import time
import webbrowser
from typing import TYPE_CHECKING, Any, Callable, List, Optional, Tuple

from gradio import encryptor, networking, queueing, strings, utils  # type: ignore
from gradio.process_examples import cache_interface_examples

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    import fastapi


class Launchable:
    """
    Gradio launchables can be launched to serve content to a port.
    """

    def launch(
        self,
        inline: bool = None,
        inbrowser: bool = None,
        share: bool = False,
        debug: bool = False,
        auth: Optional[Callable | Tuple[str, str] | List[Tuple[str, str]]] = None,
        auth_message: Optional[str] = None,
        private_endpoint: Optional[str] = None,
        prevent_thread_lock: bool = False,
        show_error: bool = True,
        server_name: Optional[str] = None,
        server_port: Optional[int] = None,
        show_tips: bool = False,
        enable_queue: bool = False,
        height: int = 500,
        width: int = 900,
        encrypt: bool = False,
        cache_examples: bool = False,
        favicon_path: Optional[str] = None,
        ssl_keyfile: Optional[str] = None,
        ssl_certfile: Optional[str] = None,
        ssl_keyfile_password: Optional[str] = None,
    ) -> Tuple[fastapi.FastAPI, str, str]:
        """
        Launches the webserver that serves the UI for the interface.
        Parameters:
        inline (bool): whether to display in the interface inline on python notebooks.
        inbrowser (bool): whether to automatically launch the interface in a new tab on the default browser.
        share (bool): whether to create a publicly shareable link from your computer for the interface.
        debug (bool): if True, and the interface was launched from Google Colab, prints the errors in the cell output.
        auth (Callable, Union[Tuple[str, str], List[Tuple[str, str]]]): If provided, username and password (or list of username-password tuples) required to access interface. Can also provide function that takes username and password and returns True if valid login.
        auth_message (str): If provided, HTML message provided on login page.
        private_endpoint (str): If provided, the public URL of the interface will be this endpoint (should generally be unchanged).
        prevent_thread_lock (bool): If True, the interface will block the main thread while the server is running.
        show_error (bool): If True, any errors in the interface will be printed in the browser console log
        server_port (int): will start gradio app on this port (if available). Can be set by environment variable GRADIO_SERVER_PORT.
        server_name (str): to make app accessible on local network, set this to "0.0.0.0". Can be set by environment variable GRADIO_SERVER_NAME.
        show_tips (bool): if True, will occasionally show tips about new Gradio features
        enable_queue (bool): if True, inference requests will be served through a queue instead of with parallel threads. Required for longer inference times (> 1min) to prevent timeout.
        width (int): The width in pixels of the iframe element containing the interface (used if inline=True)
        height (int): The height in pixels of the iframe element containing the interface (used if inline=True)
        encrypt (bool): If True, flagged data will be encrypted by key provided by creator at launch
        cache_examples (bool): If True, examples outputs will be processed and cached in a folder, and will be used if a user uses an example input.
        favicon_path (str): If a path to a file (.png, .gif, or .ico) is provided, it will be used as the favicon for the web page.
        ssl_keyfile (str): If a path to a file is provided, will use this as the private key file to create a local server running on https.
        ssl_certfile (str): If a path to a file is provided, will use this as the signed certificate for https. Needs to be provided if ssl_keyfile is provided.
        ssl_keyfile_password (str): If a password is provided, will use this with the ssl certificate for https.
        Returns:
        app (fastapi.FastAPI): FastAPI app object
        path_to_local_server (str): Locally accessible link
        share_url (str): Publicly accessible link (if share=True)
        """
        self.config = self.get_config_file()
        self.cache_examples = cache_examples
        if (
            auth
            and not callable(auth)
            and not isinstance(auth[0], tuple)
            and not isinstance(auth[0], list)
        ):
            auth = [auth]
        self.auth = auth
        self.auth_message = auth_message
        self.show_tips = show_tips
        self.show_error = show_error
        self.height = height
        self.width = width
        self.favicon_path = favicon_path
        self.is_space = True if os.getenv("SYSTEM") == "spaces" else False

        if hasattr(self, "encrypt") and self.encrypt is None:
            self.encrypt = encrypt
        if hasattr(self, "encrypt") and self.encrypt:
            self.encryption_key = encryptor.get_key(
                getpass.getpass("Enter key for encryption: ")
            )

        if hasattr(self, "enable_queue") and self.enable_queue is None:
            self.enable_queue = enable_queue

        config = self.get_config_file()
        self.config = config

        if self.cache_examples:
            cache_interface_examples(self)

        server_port, path_to_local_server, app, server = networking.start_server(
            self,
            server_name,
            server_port,
            ssl_keyfile,
            ssl_certfile,
            ssl_keyfile_password,
        )

        self.local_url = path_to_local_server
        self.server_port = server_port
        self.status = "RUNNING"
        self.server_app = app
        self.server = server

        utils.launch_counter()

        # If running in a colab or not able to access localhost,
        # automatically create a shareable link.
        is_colab = utils.colab_check()
        if is_colab or not (networking.url_ok(path_to_local_server)):
            share = True
            if is_colab:
                if debug:
                    print(strings.en["COLAB_DEBUG_TRUE"])
                else:
                    print(strings.en["COLAB_DEBUG_FALSE"])
        else:
            print(strings.en["RUNNING_LOCALLY"].format(path_to_local_server))
        if is_colab and self.requires_permissions:
            print(strings.en["MEDIA_PERMISSIONS_IN_COLAB"])

        if private_endpoint is not None:
            share = True

        if share:
            if self.is_space:
                raise RuntimeError("Share is not supported when you are in Spaces")
            try:
                share_url = networking.setup_tunnel(server_port, private_endpoint)
                self.share_url = share_url
                print(strings.en["SHARE_LINK_DISPLAY"].format(share_url))
                if private_endpoint:
                    print(strings.en["PRIVATE_LINK_MESSAGE"])
                else:
                    print(strings.en["SHARE_LINK_MESSAGE"])
            except RuntimeError:
                if self.analytics_enabled:
                    utils.error_analytics(self.ip_address, "Not able to set up tunnel")
                share_url = None
                share = False
                print(strings.en["COULD_NOT_GET_SHARE_LINK"])
        else:
            print(strings.en["PUBLIC_SHARE_TRUE"])
            share_url = None

        self.share = share

        if inbrowser:
            link = share_url if share else path_to_local_server
            webbrowser.open(link)

        # Check if running in a Python notebook in which case, display inline
        if inline is None:
            inline = utils.ipython_check() and (auth is None)
        if inline:
            if auth is not None:
                print(
                    "Warning: authentication is not supported inline. Please"
                    "click the link to access the interface in a new tab."
                )
            try:
                from IPython.display import IFrame, display  # type: ignore

                if share:
                    while not networking.url_ok(share_url):
                        time.sleep(1)
                    display(IFrame(share_url, width=self.width, height=self.height))
                else:
                    display(
                        IFrame(
                            path_to_local_server, width=self.width, height=self.height
                        )
                    )
            except ImportError:
                pass

        data = {
            "launch_method": "browser" if inbrowser else "inline",
            "is_google_colab": is_colab,
            "is_sharing_on": share,
            "share_url": share_url,
            "ip_address": self.ip_address,
            "enable_queue": self.enable_queue,
            "show_tips": self.show_tips,
            "api_mode": self.api_mode,
            "server_name": server_name,
            "server_port": server_port,
            "is_spaces": self.is_space,
        }
        if self.analytics_enabled:
            utils.launch_analytics(data)

        utils.show_tip(self)

        # Block main thread if debug==True
        if debug or int(os.getenv("GRADIO_DEBUG", 0)) == 1:
            self.block_thread()
        # Block main thread if running in a script to stop script from exiting
        is_in_interactive_mode = bool(getattr(sys, "ps1", sys.flags.interactive))
        if not prevent_thread_lock and not is_in_interactive_mode:
            self.block_thread()

        return app, path_to_local_server, share_url

    def close(self, verbose: bool = True) -> None:
        """
        Closes the Interface that was launched and frees the port.
        """
        try:
            self.server.close()
            if verbose:
                print("Closing server running on port: {}".format(self.server_port))
        except (AttributeError, OSError):  # can't close if not running
            pass

    def block_thread(
        self,
    ) -> None:
        """Block main thread until interrupted by user."""
        try:
            while True:
                time.sleep(0.1)
        except (KeyboardInterrupt, OSError):
            print("Keyboard interruption in main thread... closing server.")
            self.server.close()
            if self.enable_queue:
                queueing.close()
