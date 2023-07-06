import argparse
from gradio import themes

parser = argparse.ArgumentParser(description='Generate themed CSS which is normally served from the /theme.css endpoint of a Gradio server.')
parser.add_argument('--outfile', type=argparse.FileType('w', encoding='latin-1'), default="-")
parser.add_argument('--theme', choices=["default", "glass", "monochrome", "soft"], default="default")
args = parser.parse_args()

ThemeClass = getattr(themes, args.theme.capitalize())
css = ThemeClass()._get_theme_css()

args.outfile.write(css)
