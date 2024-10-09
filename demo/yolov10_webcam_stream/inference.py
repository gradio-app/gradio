import time
import cv2
import numpy as np
import onnxruntime  # type: ignore

from utils import draw_detections  # type: ignore


class YOLOv10:
    def __init__(self, path):
        # Initialize model
        self.initialize_model(path)

    def __call__(self, image):
        return self.detect_objects(image)

    def initialize_model(self, path):
        self.session = onnxruntime.InferenceSession(
            path, providers=onnxruntime.get_available_providers()
        )
        # Get model info
        self.get_input_details()
        self.get_output_details()

    def detect_objects(self, image, conf_threshold=0.3):
        input_tensor = self.prepare_input(image)

        # Perform inference on the image
        new_image = self.inference(image, input_tensor, conf_threshold)

        return new_image

    def prepare_input(self, image):
        self.img_height, self.img_width = image.shape[:2]

        input_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize input image
        input_img = cv2.resize(input_img, (self.input_width, self.input_height))

        # Scale input pixel values to 0 to 1
        input_img = input_img / 255.0
        input_img = input_img.transpose(2, 0, 1)
        input_tensor = input_img[np.newaxis, :, :, :].astype(np.float32)

        return input_tensor

    def inference(self, image, input_tensor, conf_threshold=0.3):
        start = time.perf_counter()
        outputs = self.session.run(
            self.output_names, {self.input_names[0]: input_tensor}
        )

        print(f"Inference time: {(time.perf_counter() - start)*1000:.2f} ms")
        (
            boxes,
            scores,
            class_ids,
        ) = self.process_output(outputs, conf_threshold)
        return self.draw_detections(image, boxes, scores, class_ids)

    def process_output(self, output, conf_threshold=0.3):
        predictions = np.squeeze(output[0])

        # Filter out object confidence scores below threshold
        scores = predictions[:, 4]
        predictions = predictions[scores > conf_threshold, :]
        scores = scores[scores > conf_threshold]

        if len(scores) == 0:
            return [], [], []

        # Get the class with the highest confidence
        class_ids = predictions[:, 5].astype(int)

        # Get bounding boxes for each object
        boxes = self.extract_boxes(predictions)

        return boxes, scores, class_ids

    def extract_boxes(self, predictions):
        # Extract boxes from predictions
        boxes = predictions[:, :4]

        # Scale boxes to original image dimensions
        boxes = self.rescale_boxes(boxes)

        # Convert boxes to xyxy format
        # boxes = xywh2xyxy(boxes)

        return boxes

    def rescale_boxes(self, boxes):
        # Rescale boxes to original image dimensions
        input_shape = np.array(
            [self.input_width, self.input_height, self.input_width, self.input_height]
        )
        boxes = np.divide(boxes, input_shape, dtype=np.float32)
        boxes *= np.array(
            [self.img_width, self.img_height, self.img_width, self.img_height]
        )
        return boxes

    def draw_detections(
        self, image, boxes, scores, class_ids, draw_scores=True, mask_alpha=0.4
    ):
        return draw_detections(image, boxes, scores, class_ids, mask_alpha)

    def get_input_details(self):
        model_inputs = self.session.get_inputs()
        self.input_names = [model_inputs[i].name for i in range(len(model_inputs))]

        self.input_shape = model_inputs[0].shape
        self.input_height = self.input_shape[2]
        self.input_width = self.input_shape[3]

    def get_output_details(self):
        model_outputs = self.session.get_outputs()
        self.output_names = [model_outputs[i].name for i in range(len(model_outputs))]


if __name__ == "__main__":
    import requests
    import tempfile
    from huggingface_hub import hf_hub_download

    model_file = hf_hub_download(
        repo_id="onnx-community/yolov10s", filename="onnx/model.onnx"
    )

    yolov8_detector = YOLOv10(model_file)

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        f.write(
            requests.get(
                "https://live.staticflickr.com/13/19041780_d6fd803de0_3k.jpg"
            ).content
        )
        f.seek(0)
        img = cv2.imread(f.name)

    # # Detect Objects
    combined_image = yolov8_detector.detect_objects(img)

    # Draw detections
    cv2.namedWindow("Output", cv2.WINDOW_NORMAL)
    cv2.imshow("Output", combined_image)
    cv2.waitKey(0)
