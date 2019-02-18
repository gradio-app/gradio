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

nest_asyncio.apply()

LOCALHOST_IP = '127.0.0.1'
SOCKET_PORT = 5680



def resize_and_crop(img, size, crop_type='top'):
    """
    Resize and crop an image to fit the specified size.
    args:
        img_path: path for the image to resize.
        modified_path: path to store the modified image.
        size: `(width, height)` tuple.
        crop_type: can be 'top', 'middle' or 'bottom', depending on this
            value, the image will cropped getting the 'top/left', 'midle' or
            'bottom/rigth' of the image to fit the size.
    raises:
        Exception: if can not open the file in img_path of there is problems
            to save the image.
        ValueError: if an invalid `crop_type` is provided.
    """
    # Get current and desired ratio for the images
    img_ratio = img.size[0] / float(img.size[1])
    ratio = size[0] / float(size[1])
    # The image is scaled/cropped vertically or horizontally depending on the ratio
    if ratio > img_ratio:
        img = img.resize((size[0], size[0] * img.size[1] / img.size[0]),
                         Image.ANTIALIAS)
        # Crop in the top, middle or bottom
        if crop_type == 'top':
            box = (0, 0, img.size[0], size[1])
        elif crop_type == 'middle':
            box = (0, (img.size[1] - size[1]) / 2, img.size[0], (img.size[1] + size[1]) / 2)
        elif crop_type == 'bottom':
            box = (0, img.size[1] - size[1], img.size[0], img.size[1])
        else:
            raise ValueError('ERROR: invalid value for crop_type')
        img = img.crop(box)
    elif ratio < img_ratio:
        img = img.resize((size[1] * img.size[0] / img.size[1], size[1]),
                         Image.ANTIALIAS)
        # Crop in the top, middle or bottom
        if crop_type == 'top':
            box = (0, 0, size[0], img.size[1])
        elif crop_type == 'middle':
            box = ((img.size[0] - size[0]) / 2, 0, (img.size[0] + size[0]) / 2, img.size[1])
        elif crop_type == 'bottom':
            box = (img.size[0] - size[0], 0, img.size[0], img.size[1])
        else:
            raise ValueError('ERROR: invalid value for crop_type')
        img = img.crop(box)
    else:
        img = img.resize((size[0], size[1]),
                         Image.ANTIALIAS)
        # If the scale is the same, we do not need to crop
    return img


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
        im = resize_and_crop(im, (28, 28))
        array = np.array(im).flatten().reshape(1, -1)
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
        im = resize_and_crop(im, (48, 48))
        array = np.array(im).flatten().reshape(1,48,48,1)
        return array 

class Class(AbstractOutput):

    def _get_template_path(self):
        return 'templates/class_output.html'
    
    def _post_process(self, prediction):
        """
        """
        # emotion_dict = {0: "Angry", 1: "Disgust", 2: "Fear", 3: "Happy", 4: "Sad", 5: "Surprise", 6: "Neutral"}
        # return emotion_dict[prediction] 
        return prediction
registry = {
    'webcam':Webcam,
    'sketchpad' :Sketchpad,
    'class' :Class,
}

class Interface():
    """
    """
    def __init__(self, input, output, model_obj, model_type, preprocessing_fn=None, postprocessing_fn=None):
        """
        :param model_type: what kind of trained model, can be 'keras' or 'sklearn'.
        :param model_obj: the model object, such as a sklearn classifier or keras model.
        :param model_params: additional model parameters.
        """
        self.input_interface = registry[input]()
        self.output_interface = registry[output]()
        self.model_type = model_type
        self.model_obj = model_obj
        self.preprocessing_fn = preprocessing_fn
        self.postprocessing_fn = postprocessing_fn

    def _build_template(self):
        input_template_path = self.input_interface._get_template_path()
        output_template_path = self.output_interface._get_template_path()
        input_page = open(input_template_path)
        output_page = open(output_template_path)
        input_soup = BeautifulSoup(input_page.read())
        output_soup = BeautifulSoup(output_page.read())

        all_io_url =  'templates/all_io.html'
        all_io_page = open(all_io_url)
        all_io_soup = BeautifulSoup(all_io_page.read())
        input_tag = all_io_soup.find("div", {"id": "input"})
        output_tag = all_io_soup.find("div", {"id": "output"})
        
        input_tag.replace_with(input_soup)
        output_tag.replace_with(output_soup)
        
        f = open("templates/tmp_html.html", "w")
        f.write(str(all_io_soup.prettify))
        return 'templates/tmp_html.html'

    def predict(self, array):
        if self.model_type=='sklearn':
            return self.model_obj.predict(array)[0]
        elif self.model_type=='keras':
            return self.model_obj.predict(array)[0].argmax()
        else:
            raise ValueError('model_type must be sklearn.')


    async def communicate(self, websocket, path):
        """
        Method that defines how this interface communicates with the websocket.
        :param websocket: a Websocket object used to communicate with the interface frontend
        :param path: ignored
        """
        while True:
            if self.preprocessing_fn is None: 
                processed_input = self.input_interface._pre_process(await websocket.recv())
            else:
                processed_input = self.preprocessing_fn(await websocket.recv())
            
            prediction = self.predict(processed_input)
            
            if self.postprocessing_fn is None: 
                processed_output = self.output_interface._post_process(prediction)
            else:
                processed_output = self.postprocessing_fn(prediction)
             
            await websocket.send(str(processed_output))

    def launch(self):
        """
        Standard method shared by interfaces that launches a websocket at a specified IP address.
        """
        webbrowser.open('file://' + os.path.realpath(self._build_template()))
        start_server = websockets.serve(self.communicate, LOCALHOST_IP, SOCKET_PORT)
        asyncio.get_event_loop().run_until_complete(start_server)
        try:
            asyncio.get_event_loop().run_forever()
        except RuntimeError:  # Runtime errors are thrown in jupyter notebooks because of async.
            pass