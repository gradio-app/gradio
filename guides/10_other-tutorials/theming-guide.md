# Theming

Tags: THEMES

## Introduction

Gradio features a built-in theming engine that lets you customize the look and feel of your app. You can choose from a variety of themes, or create your own. To do so, pass the `theme=` kwarg to the `Blocks` or `Interface` constructor. For example:

```python
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-soft.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

Gradio comes with a set of prebuilt themes which you can load from `gr.themes.*`. These are:


* `gr.themes.Base()` - the `"base"` theme sets the primary color to blue but otherwise has minimal styling, making it particularly useful as a base for creating new, custom themes.
* `gr.themes.Default()` - the `"default"` Gradio 5 theme, with a vibrant orange primary color and gray secondary color.
* `gr.themes.Origin()` - the `"origin"` theme is most similar to Gradio 4 styling. Colors, especially in light mode, are more subdued than the Gradio 5 default theme.
* `gr.themes.Citrus()` - the `"citrus"` theme uses a yellow primary color, highlights form elements that are in focus, and includes fun 3D effects when buttons are clicked.
* `gr.themes.Monochrome()` - the `"monochrome"` theme uses a black primary and white secondary color, and uses serif-style fonts, giving the appearance of a black-and-white newspaper. 
* `gr.themes.Soft()` - the `"soft"` theme uses a purpose primary color and white secondary color. It also increases the border radii and around buttons and form elements and highlights labels.
* `gr.themes.Glass()` - the `"glass"` theme has a blue primary color and a transclucent gray secondary color. The theme also uses vertical gradients to create a glassy effect.
* `gr.themes.Ocean()` - the `"ocean"` theme has a blue-green primary color and gray secondary color. The theme also uses horizontal gradients, especially for buttons and some form elements.


Each of these themes set values for hundreds of CSS variables. You can use prebuilt themes as a starting point for your own custom themes, or you can create your own themes from scratch. Let's take a look at each approach.

## Using the Theme Builder

The easiest way to build a theme is using the Theme Builder. To launch the Theme Builder locally, run the following code:

```python
import gradio as gr

gr.themes.builder()
```

$demo_theme_builder

You can use the Theme Builder running on Spaces above, though it runs much faster when you launch it locally via `gr.themes.builder()`.

As you edit the values in the Theme Builder, the app will preview updates in real time. You can download the code to generate the theme you've created so you can use it in any Gradio app.

In the rest of the guide, we will cover building themes programmatically.

## Extending Themes via the Constructor

Although each theme has hundreds of CSS variables, the values for most these variables are drawn from 8 core variables which can be set through the constructor of each prebuilt theme. Modifying these 8 arguments allows you to quickly change the look and feel of your app.

### Core Colors

The first 3 constructor arguments set the colors of the theme and are `gradio.themes.Color` objects. Internally, these Color objects hold brightness values for the palette of a single hue, ranging from 50, 100, 200..., 800, 900, 950. Other CSS variables are derived from these 3 colors.

The 3 color constructor arguments are:

- `primary_hue`: This is the color draws attention in your theme. In the default theme, this is set to `gradio.themes.colors.orange`.
- `secondary_hue`: This is the color that is used for secondary elements in your theme. In the default theme, this is set to `gradio.themes.colors.blue`.
- `neutral_hue`: This is the color that is used for text and other neutral elements in your theme. In the default theme, this is set to `gradio.themes.colors.gray`.

You could modify these values using their string shortcuts, such as

```python
with gr.Blocks(theme=gr.themes.Default(primary_hue="red", secondary_hue="pink")) as demo:
    ...
```

or you could use the `Color` objects directly, like this:

```python
with gr.Blocks(theme=gr.themes.Default(primary_hue=gr.themes.colors.red, secondary_hue=gr.themes.colors.pink)) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-1.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

Predefined colors are:

- `slate`
- `gray`
- `zinc`
- `neutral`
- `stone`
- `red`
- `orange`
- `amber`
- `yellow`
- `lime`
- `green`
- `emerald`
- `teal`
- `cyan`
- `sky`
- `blue`
- `indigo`
- `violet`
- `purple`
- `fuchsia`
- `pink`
- `rose`

You could also create your own custom `Color` objects and pass them in.

### Core Sizing

The next 3 constructor arguments set the sizing of the theme and are `gradio.themes.Size` objects. Internally, these Size objects hold pixel size values that range from `xxs` to `xxl`. Other CSS variables are derived from these 3 sizes.

- `spacing_size`: This sets the padding within and spacing between elements. In the default theme, this is set to `gradio.themes.sizes.spacing_md`.
- `radius_size`: This sets the roundedness of corners of elements. In the default theme, this is set to `gradio.themes.sizes.radius_md`.
- `text_size`: This sets the font size of text. In the default theme, this is set to `gradio.themes.sizes.text_md`.

You could modify these values using their string shortcuts, such as

```python
with gr.Blocks(theme=gr.themes.Default(spacing_size="sm", radius_size="none")) as demo:
    ...
```

or you could use the `Size` objects directly, like this:

```python
with gr.Blocks(theme=gr.themes.Default(spacing_size=gr.themes.sizes.spacing_sm, radius_size=gr.themes.sizes.radius_none)) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-2.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

The predefined size objects are:

- `radius_none`
- `radius_sm`
- `radius_md`
- `radius_lg`
- `spacing_sm`
- `spacing_md`
- `spacing_lg`
- `text_sm`
- `text_md`
- `text_lg`

You could also create your own custom `Size` objects and pass them in.

### Core Fonts

The final 2 constructor arguments set the fonts of the theme. You can pass a list of fonts to each of these arguments to specify fallbacks. If you provide a string, it will be loaded as a system font. If you provide a `gradio.themes.GoogleFont`, the font will be loaded from Google Fonts.

- `font`: This sets the primary font of the theme. In the default theme, this is set to `gradio.themes.GoogleFont("IBM Plex Sans")`.
- `font_mono`: This sets the monospace font of the theme. In the default theme, this is set to `gradio.themes.GoogleFont("IBM Plex Mono")`.

You could modify these values such as the following:

```python
with gr.Blocks(theme=gr.themes.Default(font=[gr.themes.GoogleFont("Inconsolata"), "Arial", "sans-serif"])) as demo:
    ...
```

<div class="wrapper">
<iframe
	src="https://gradio-theme-extended-step-3.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

## Extending Themes via `.set()`

You can also modify the values of CSS variables after the theme has been loaded. To do so, use the `.set()` method of the theme object to get access to the CSS variables. For example:

```python
theme = gr.themes.Default(primary_hue="blue").set(
    loader_color="#FF0000",
    slider_color="#FF0000",
)

with gr.Blocks(theme=theme) as demo:
    ...
```

In the example above, we've set the `loader_color` and `slider_color` variables to `#FF0000`, despite the overall `primary_color` using the blue color palette. You can set any CSS variable that is defined in the theme in this manner.

Your IDE type hinting should help you navigate these variables. Since there are so many CSS variables, let's take a look at how these variables are named and organized.

### CSS Variable Naming Conventions

CSS variable names can get quite long, like `button_primary_background_fill_hover_dark`! However they follow a common naming convention that makes it easy to understand what they do and to find the variable you're looking for. Separated by underscores, the variable name is made up of:

1. The target element, such as `button`, `slider`, or `block`.
2. The target element type or sub-element, such as `button_primary`, or `block_label`.
3. The property, such as `button_primary_background_fill`, or `block_label_border_width`.
4. Any relevant state, such as `button_primary_background_fill_hover`.
5. If the value is different in dark mode, the suffix `_dark`. For example, `input_border_color_focus_dark`.

Of course, many CSS variable names are shorter than this, such as `table_border_color`, or `input_shadow`.

### CSS Variable Organization

Though there are hundreds of CSS variables, they do not all have to have individual values. They draw their values by referencing a set of core variables and referencing each other. This allows us to only have to modify a few variables to change the look and feel of the entire theme, while also getting finer control of individual elements that we may want to modify.

#### Referencing Core Variables

To reference one of the core constructor variables, precede the variable name with an asterisk. To reference a core color, use the `*primary_`, `*secondary_`, or `*neutral_` prefix, followed by the brightness value. For example:

```python
theme = gr.themes.Default(primary_hue="blue").set(
    button_primary_background_fill="*primary_200",
    button_primary_background_fill_hover="*primary_300",
)
```

In the example above, we've set the `button_primary_background_fill` and `button_primary_background_fill_hover` variables to `*primary_200` and `*primary_300`. These variables will be set to the 200 and 300 brightness values of the blue primary color palette, respectively.

Similarly, to reference a core size, use the `*spacing_`, `*radius_`, or `*text_` prefix, followed by the size value. For example:

```python
theme = gr.themes.Default(radius_size="md").set(
    button_primary_border_radius="*radius_xl",
)
```

In the example above, we've set the `button_primary_border_radius` variable to `*radius_xl`. This variable will be set to the `xl` setting of the medium radius size range.

#### Referencing Other Variables

Variables can also reference each other. For example, look at the example below:

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_hover="#FF0000",
    button_primary_border="#FF0000",
)
```

Having to set these values to a common color is a bit tedious. Instead, we can reference the `button_primary_background_fill` variable in the `button_primary_background_fill_hover` and `button_primary_border` variables, using a `*` prefix.

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_hover="*button_primary_background_fill",
    button_primary_border="*button_primary_background_fill",
)
```

Now, if we change the `button_primary_background_fill` variable, the `button_primary_background_fill_hover` and `button_primary_border` variables will automatically update as well.

This is particularly useful if you intend to share your theme - it makes it easy to modify the theme without having to change every variable.

Note that dark mode variables automatically reference each other. For example:

```python
theme = gr.themes.Default().set(
    button_primary_background_fill="#FF0000",
    button_primary_background_fill_dark="#AAAAAA",
    button_primary_border="*button_primary_background_fill",
    button_primary_border_dark="*button_primary_background_fill_dark",
)
```

`button_primary_border_dark` will draw its value from `button_primary_background_fill_dark`, because dark mode always draw from the dark version of the variable.

## Creating a Full Theme

Let's say you want to create a theme from scratch! We'll go through it step by step - you can also see the source of prebuilt themes in the gradio source repo for reference - [here's the source](https://github.com/gradio-app/gradio/blob/main/gradio/themes/monochrome.py) for the Monochrome theme.

Our new theme class will inherit from `gradio.themes.Base`, a theme that sets a lot of convenient defaults. Let's make a simple demo that creates a dummy theme called Seafoam, and make a simple app that uses it.

$code_theme_new_step_1

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-1.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

The Base theme is very barebones, and uses `gr.themes.Blue` as it primary color - you'll note the primary button and the loading animation are both blue as a result. Let's change the defaults core arguments of our app. We'll overwrite the constructor and pass new defaults for the core constructor arguments.

We'll use `gr.themes.Emerald` as our primary color, and set secondary and neutral hues to `gr.themes.Blue`. We'll make our text larger using `text_lg`. We'll use `Quicksand` as our default font, loaded from Google Fonts.

$code_theme_new_step_2

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-2.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

See how the primary button and the loading animation are now green? These CSS variables are tied to the `primary_hue` variable.

Let's modify the theme a bit more directly. We'll call the `set()` method to overwrite CSS variable values explicitly. We can use any CSS logic, and reference our core constructor arguments using the `*` prefix.

$code_theme_new_step_3

<div class="wrapper">
<iframe
	src="https://gradio-theme-new-step-3.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

Look how fun our theme looks now! With just a few variable changes, our theme looks completely different.

You may find it helpful to explore the [source code of the other prebuilt themes](https://github.com/gradio-app/gradio/blob/main/gradio/themes) to see how they modified the base theme. You can also find your browser's Inspector useful to select elements from the UI and see what CSS variables are being used in the styles panel.

## Sharing Themes

Once you have created a theme, you can upload it to the HuggingFace Hub to let others view it, use it, and build off of it!

### Uploading a Theme

There are two ways to upload a theme, via the theme class instance or the command line. We will cover both of them with the previously created `seafoam` theme.

- Via the class instance

Each theme instance has a method called `push_to_hub` we can use to upload a theme to the HuggingFace hub.

```python
seafoam.push_to_hub(repo_name="seafoam",
                    version="0.0.1",
					hf_token="<token>")
```

- Via the command line

First save the theme to disk

```python
seafoam.dump(filename="seafoam.json")
```

Then use the `upload_theme` command:

```bash
upload_theme\
"seafoam.json"\
"seafoam"\
--version "0.0.1"\
--hf_token "<token>"
```

In order to upload a theme, you must have a HuggingFace account and pass your [Access Token](https://huggingface.co/docs/huggingface_hub/quick-start#login)
as the `hf_token` argument. However, if you log in via the [HuggingFace command line](https://huggingface.co/docs/huggingface_hub/quick-start#login) (which comes installed with `gradio`),
you can omit the `hf_token` argument.

The `version` argument lets you specify a valid [semantic version](https://www.geeksforgeeks.org/introduction-semantic-versioning/) string for your theme.
That way your users are able to specify which version of your theme they want to use in their apps. This also lets you publish updates to your theme without worrying
about changing how previously created apps look. The `version` argument is optional. If omitted, the next patch version is automatically applied.

### Theme Previews

By calling `push_to_hub` or `upload_theme`, the theme assets will be stored in a [HuggingFace space](https://huggingface.co/docs/hub/spaces-overview).

The theme preview for our seafoam theme is here: [seafoam preview](https://huggingface.co/spaces/gradio/seafoam).

<div class="wrapper">
<iframe
	src="https://gradio-seafoam.hf.space?__theme=light"
	frameborder="0"
></iframe>
</div>

### Discovering Themes

The [Theme Gallery](https://huggingface.co/spaces/gradio/theme-gallery) shows all the public gradio themes. After publishing your theme,
it will automatically show up in the theme gallery after a couple of minutes.

You can sort the themes by the number of likes on the space and from most to least recently created as well as toggling themes between light and dark mode.

<div class="wrapper">
<iframe
	src="https://gradio-theme-gallery.static.hf.space"
	frameborder="0"
></iframe>
</div>

### Downloading

To use a theme from the hub, use the `from_hub` method on the `ThemeClass` and pass it to your app:

```python
my_theme = gr.Theme.from_hub("gradio/seafoam")

with gr.Blocks(theme=my_theme) as demo:
    ....
```

You can also pass the theme string directly to `Blocks` or `Interface` (`gr.Blocks(theme="gradio/seafoam")`)

You can pin your app to an upstream theme version by using semantic versioning expressions.

For example, the following would ensure the theme we load from the `seafoam` repo was between versions `0.0.1` and `0.1.0`:

```python
with gr.Blocks(theme="gradio/seafoam@>=0.0.1,<0.1.0") as demo:
    ....
```

Enjoy creating your own themes! If you make one you're proud of, please share it with the world by uploading it to the hub!
If you tag us on [Twitter](https://twitter.com/gradio) we can give your theme a shout out!

<style>
.wrapper {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 25px;
    height: 0;
}
.wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
