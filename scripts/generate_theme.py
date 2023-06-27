from gradio.themes.default import Default

css = Default()._get_theme_css()

with open(".storybook/public/theme.css", "w") as file1:
    file1.write(css)