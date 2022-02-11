import os

import cairo


def add_line_breaks(text, num_char):
    if len(text) > num_char:
        text_list = text.split()
        text = ""
        total_count = 0
        count = 0
        for word in text_list:
            if total_count > num_char * 5:
                text = text[:-1]
                text += "..."
                break
            count += len(word)
            if count > num_char:
                text += word + "\n"
                total_count += count
                count = 0
            else:
                text += word + " "
                total_count += len(word + " ")
        return text
    return text


def generate_meta_image(guide):
    IMG_GUIDE_LOCATION = "dist/assets/img/guides"
    title, tags, guide_name = guide["pretty_name"], guide["tags"], guide["name"]
    surface = cairo.ImageSurface.create_from_png("src/assets/img/guides/base-image.png")
    ctx = cairo.Context(surface)
    ctx.scale(500, 500)
    ctx.set_source_rgba(0.611764706, 0.639215686, 0.6862745098, 1)
    ctx.select_font_face("Arial", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(0.15)
    ctx.move_to(0.3, 0.55)
    ctx.show_text("gradio.app/guides")
    if tags:
        if len(tags) > 5:
            tags = tags[:5]
        tags = "  |  ".join(tags)
        ctx.move_to(0.3, 2.2)
        ctx.show_text(tags)
    ctx.set_source_rgba(0.352941176, 0.352941176, 0.352941176, 1)
    ctx.set_font_size(0.28)
    title_breaked = add_line_breaks(title, 10)

    if "\n" in title_breaked:
        for i, t in enumerate(title_breaked.split("\n")):
            ctx.move_to(0.3, 0.9 + i * 0.4)
            ctx.show_text(t)
    else:
        ctx.move_to(0.3, 1.0)
        ctx.show_text(title_breaked)

    os.makedirs(IMG_GUIDE_LOCATION, exist_ok=True)
    image_path = f"{IMG_GUIDE_LOCATION}/{guide_name}.png"
    surface.write_to_png(image_path)
