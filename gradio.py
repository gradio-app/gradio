from abc import ABC, abstractmethod
import base64
import asyncio
import websockets
import nest_asyncio
from PIL import Image
from io import BytesIO
import numpy as np
import os
import webbrowser
from bs4 import BeautifulSoup
import networking
import preprocessing_utils

nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
SOCKET_PORT = 5680


class AbstractInput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    """

    def __init__(self):
        super().__init__()


    @abstractmethod
    def _get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def _pre_process(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

class AbstractOutput(ABC):
    """
    An abstract class for defining the methods that all gradio inputs should have.
    """

    def __init__(self):
        """
        """
        super().__init__()

    @abstractmethod
    def _get_template_path(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass

    @abstractmethod
    def _post_process(self):
        """
        All interfaces should define a method that returns the path to its template.
        """
        pass


class Sketchpad(AbstractInput):

    def _get_template_path(self):
        return 'templates/sketchpad_input.html'
    
    def _pre_process(self, imgstring):
        """
        """
        content = imgstring.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (28, 28))
        array = np.array(im).flatten().reshape(1, 28, 28, 1)
        return array 


class Webcam(AbstractInput):

    def _get_template_path(self):
        return 'templates/webcam_input.html'
    
    def _pre_process(self, imgstring):
        """
        """
        content = imgstring.split(';')[1]
        image_encoded = content.split(',')[1]
        body = base64.decodebytes(image_encoded.encode('utf-8'))
        im = Image.open(BytesIO(base64.b64decode(image_encoded))).convert('L')
        im = preprocessing_utils.resize_and_crop(im, (48, 48))
        array = np.array(im).flatten().reshape(1,48,48,1)
        return array 


class Class(AbstractOutput):

    def _get_template_path(self):
        return 'templates/class_output.html'
    
    def _post_process(self, prediction):
        """
        """
        return prediction

registry = {
    'webcam':Webcam,
    'sketchpad' :Sketchpad,
    'class' :Class,
}


class Interface():
    """
    """
    build_template_path = 'templates/tmp_html.html'

    def __init__(self, input, output, model_obj, model_type, **model_params):
        """
        :param model_type: what kind of trained model, can be 'keras' or 'sklearn'.
        :param model_obj: the model object, such as a sklearn classifier or keras model.
        :param model_params: additional model parameters.
        """
        self.input_interface = registry[input]()
        self.output_interface = registry[output]()
        self.model_type = model_type
        self.model_obj = model_obj
        self.model_params = model_params

    def _build_template(self):
        input_template_path = self.input_interface._get_template_path()
        output_template_path = self.output_interface._get_template_path()
        input_page = open(input_template_path)
        output_page = open(output_template_path)
        input_soup = BeautifulSoup(input_page.read(), features="html.parser")
        output_soup = BeautifulSoup(output_page.read(), features="html.parser")

        all_io_url =  'templates/all_io.html'
        all_io_page = open(all_io_url)
        all_io_soup = BeautifulSoup(all_io_page.read(), features="html.parser")
        input_tag = all_io_soup.find("div", {"id": "input"})
        output_tag = all_io_soup.find("div", {"id": "output"})
        
        input_tag.replace_with(input_soup)
        output_tag.replace_with(output_soup)
        
        f = open(self.build_template_path, "w")
        f.write(str(all_io_soup.prettify))
        return self.build_template_path

    def predict(self, array):
        if self.model_type=='sklearn':
            return self.model_obj.predict(array)[0]
        elif self.model_type=='keras':
            return self.model_obj.predict(array)[0].argmax()
        elif self.model_type=='func':
            return self.model_obj(array)
        else:
            raise ValueError('model_type must be one of: "sklearn" or "keras" or "func".')


    async def communicate(self, websocket, path):
        """
        Method that defines how this interface communicates with the websocket.
        :param websocket: a Websocket object used to communicate with the interface frontend
        :param path: ignored
        """
        while True:
            processed_input = self.input_interface._pre_process(await websocket.recv())
            prediction = self.predict(processed_input)
            processed_output = self.output_interface._post_process(prediction)
            await websocket.send(str(processed_output))

    def launch(self, share_link=True):
        """
        Standard method shared by interfaces that launches a websocket at a specified IP address.
        """
        path_to_server = networking.start_simple_server()
        path_to_template = self._build_template()
        chrome_path = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe %s'  # TODO(abidlabs): remove

        print(path_to_server + path_to_template)
        webbrowser.get(chrome_path).open(path_to_server + path_to_template)  # TODO(abidlabs): fix this

        start_server = websockets.serve(self.communicate, LOCALHOST_IP, SOCKET_PORT)

        if share_link:
            ngrok_url = networking.setup_ngrok()
            print("Model accessiable for 8 hours at: {}".format(ngrok_url))

        asyncio.get_event_loop().run_until_complete(start_server)
        try:
            asyncio.get_event_loop().run_forever()
        except RuntimeError:  # Runtime errors are thrown in jupyter notebooks because of async.
            pass