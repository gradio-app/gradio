from PIL import ImageDraw, ImageFont  # type: ignore
import colorsys


def get_color(label):
    # Simple hash function to generate consistent colors for each label
    hash_value = hash(label)
    hue = (hash_value % 100) / 100.0
    saturation = 0.7
    value = 0.9
    rgb = colorsys.hsv_to_rgb(hue, saturation, value)
    return tuple(int(x * 255) for x in rgb)


def draw_bounding_boxes(image, results: dict, model, threshold=0.3):
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    for score, label_id, box in zip(
        results["scores"], results["labels"], results["boxes"]
    ):
        if score > threshold:
            label = model.config.id2label[label_id.item()]
            box = [round(i, 2) for i in box.tolist()]
            color = get_color(label)

            # Draw bounding box
            draw.rectangle(box, outline=color, width=3) # type: ignore

            # Prepare text
            text = f"{label}: {score:.2f}"
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            # Draw text background
            draw.rectangle(
                [box[0], box[1] - text_height - 4, box[0] + text_width, box[1]], # type: ignore
                fill=color, # type: ignore
            )

            # Draw text
            draw.text((box[0], box[1] - text_height - 4), text, fill="white", font=font)

    return image
