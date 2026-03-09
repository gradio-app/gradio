import argparse

from gradio import themes

parser = argparse.ArgumentParser(
    description="Generate themed CSS which is normally served from the /theme.css endpoint of a Gradio server."
)
parser.add_argument(
    "--outfile", type=argparse.FileType("w", encoding="latin-1"), default="-"
)
parser.add_argument(
    "--theme", choices=["default", "glass", "monochrome", "soft"], default="default"
)
parser.add_argument(
    "--website", action="store_true", help="Adjust paths for SvelteKit website"
)
args = parser.parse_args()

ThemeClass = getattr(themes, args.theme.capitalize())
css = ThemeClass()._get_theme_css()

if args.website:
    css = css.replace("url('static/", "url('/")

args.outfile.write(css)
