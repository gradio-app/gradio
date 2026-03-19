# CSS Variables Reference

Tags: THEMES

This page lists all available CSS variables that can be set via the `.set()` method on a Gradio theme, organized by category. The CSS Variable column shows the variable name as used in CSS (e.g. in custom stylesheets), while the Default column shows the value set by the `Base` theme.

For more information on how to use these variables, see the [Theming Guide](/guides/theming-guide).

<!-- CSS_VARS_TABLE_START -->

## Body Attributes

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--body-background-fill` | The background of the entire app. | `*background_fill_primary` |
| `--body-background-fill-dark` | The background of the entire app in dark mode. | `*background_fill_primary` |
| `--body-text-color` | The default text color. | `*neutral_800` |
| `--body-text-color-dark` | The default text color in dark mode. | `*neutral_100` |
| `--body-text-size` | The default text size. | `*text_md` |
| `--body-text-color-subdued` | The text color used for softer, less important text. | `*neutral_400` |
| `--body-text-color-subdued-dark` | The text color used for softer, less important text in dark mode. | `*neutral_400` |
| `--body-text-weight` | The default text weight. | `400` |
| `--embed-radius` | The corner radius used for embedding when the app is embedded within a page. | `*radius_sm` |

## Element Colors

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--background-fill-primary` | The background primarily used for items placed directly on the page. | `white` |
| `--background-fill-primary-dark` | The background primarily used for items placed directly on the page in dark mode. | `*neutral_950` |
| `--background-fill-secondary` | The background primarily used for items placed on top of another item. | `*neutral_50` |
| `--background-fill-secondary-dark` | The background primarily used for items placed on top of another item in dark mode. | `*neutral_900` |
| `--border-color-accent` | The border color used for accented items. | `*primary_300` |
| `--border-color-accent-dark` | The border color used for accented items in dark mode. | `*neutral_600` |
| `--border-color-accent-subdued` | The subdued border color for accented items. | `*border_color_accent` |
| `--border-color-accent-subdued-dark` | The subdued border color for accented items in dark mode. | `*border_color_accent` |
| `--border-color-primary` | The border color primarily used for items placed directly on the page. | `*neutral_200` |
| `--border-color-primary-dark` | The border color primarily used for items placed directly on the page in dark mode. | `*neutral_700` |
| `--color-accent` | The color used for accented items. | `*primary_500` |
| `--color-accent-soft` | The softer color used for accented items. | `*primary_50` |
| `--color-accent-soft-dark` | The softer color used for accented items in dark mode. | `*neutral_700` |
| `--link-text-color` | The text color used for links. | `*secondary_600` |
| `--link-text-color-dark` | The text color used for links in dark mode. | `*secondary_500` |
| `--link-text-color-active` | The text color used for links when they are active. | `*secondary_600` |
| `--link-text-color-active-dark` | The text color used for links when they are active in dark mode. | `*secondary_500` |
| `--link-text-color-hover` | The text color used for links when they are hovered over. | `*secondary_700` |
| `--link-text-color-hover-dark` | The text color used for links when they are hovered over in dark mode. | `*secondary_400` |
| `--link-text-color-visited` | The text color used for links when they have been visited. | `*secondary_500` |
| `--link-text-color-visited-dark` | The text color used for links when they have been visited in dark mode. | `*secondary_600` |
| `--prose-text-size` | The text size used for markdown and other prose. | `*text_md` |
| `--prose-text-weight` | The text weight used for markdown and other prose. | `400` |
| `--prose-header-text-weight` | The text weight of a header used for markdown and other prose. | `600` |
| `--code-background-fill` | The background color of code blocks. | `*neutral_100` |
| `--code-background-fill-dark` | The background color of code blocks in dark mode. | `*neutral_800` |

## Shadows

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--shadow-drop` | Drop shadow used by other shadowed items. | `rgba(0,0,0,0.05) 0px 1px 2px 0px` |
| `--shadow-drop-lg` | Larger drop shadow used by other shadowed items. | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-inset` | Inset shadow used by other shadowed items. | `rgba(0,0,0,0.05) 0px 2px 4px 0px inset` |
| `--shadow-spread` | Size of shadow spread used by shadowed items. | `3px` |
| `--shadow-spread-dark` | Size of shadow spread used by shadowed items in dark mode. | `1px` |

## Layout Atoms

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--block-background-fill` | The background around an item. | `*background_fill_primary` |
| `--block-background-fill-dark` | The background around an item in dark mode. | `*neutral_800` |
| `--block-border-color` | The border color around an item. | `*border_color_primary` |
| `--block-border-color-dark` | The border color around an item in dark mode. | `*border_color_primary` |
| `--block-border-width` | The border width around an item. | `1px` |
| `--block-border-width-dark` | The border width around an item in dark mode. |  |
| `--block-info-text-color` | The color of the info text. | `*body_text_color_subdued` |
| `--block-info-text-color-dark` | The color of the info text in dark mode. | `*body_text_color_subdued` |
| `--block-info-text-size` | The size of the info text. | `*text_sm` |
| `--block-info-text-weight` | The weight of the info text. | `400` |
| `--block-label-background-fill` | The background of the title label of a media element (e.g. image). | `*background_fill_primary` |
| `--block-label-background-fill-dark` | The background of the title label of a media element (e.g. image) in dark mode. | `*background_fill_secondary` |
| `--block-label-border-color` | The border color of the title label of a media element (e.g. image). | `*border_color_primary` |
| `--block-label-border-color-dark` | The border color of the title label of a media element (e.g. image) in dark mode. | `*border_color_primary` |
| `--block-label-border-width` | The border width of the title label of a media element (e.g. image). | `1px` |
| `--block-label-border-width-dark` | The border width of the title label of a media element (e.g. image) in dark mode. |  |
| `--block-label-shadow` | The shadow of the title label of a media element (e.g. image). | `*block_shadow` |
| `--block-label-text-color` | The text color of the title label of a media element (e.g. image). | `*neutral_500` |
| `--block-label-text-color-dark` | The text color of the title label of a media element (e.g. image) in dark mode. | `*neutral_200` |
| `--block-label-margin` | The margin of the title label of a media element (e.g. image) from its surrounding container. | `0` |
| `--block-label-padding` | The padding of the title label of a media element (e.g. image). | `*spacing_sm *spacing_lg` |
| `--block-label-radius` | The corner radius of the title label of a media element (e.g. image). | `calc(*radius_sm - 1px) 0 calc(*radius_sm - 1px) 0` |
| `--block-label-right-radius` | The corner radius of a right-aligned helper label. | `0 calc(*radius_sm - 1px) 0 calc(*radius_sm - 1px)` |
| `--block-label-text-size` | The text size of the title label of a media element (e.g. image). | `*text_sm` |
| `--block-label-text-weight` | The text weight of the title label of a media element (e.g. image). | `400` |
| `--block-padding` | The padding around an item. | `*spacing_xl calc(*spacing_xl + 2px)` |
| `--block-radius` | The corner radius around an item. | `*radius_sm` |
| `--block-shadow` | The shadow under an item. | `none` |
| `--block-shadow-dark` | The shadow under an item in dark mode. |  |
| `--block-title-background-fill` | The background of the title of a form element (e.g. textbox). | `none` |
| `--block-title-background-fill-dark` | The background of the title of a form element (e.g. textbox) in dark mode. |  |
| `--block-title-border-color` | The border color of the title of a form element (e.g. textbox). | `none` |
| `--block-title-border-color-dark` | The border color of the title of a form element (e.g. textbox) in dark mode. |  |
| `--block-title-border-width` | The border width of the title of a form element (e.g. textbox). | `0px` |
| `--block-title-border-width-dark` | The border width of the title of a form element (e.g. textbox) in dark mode. |  |
| `--block-title-text-color` | The text color of the title of a form element (e.g. textbox). | `*neutral_500` |
| `--block-title-text-color-dark` | The text color of the title of a form element (e.g. textbox) in dark mode. | `*neutral_200` |
| `--block-title-padding` | The padding of the title of a form element (e.g. textbox). | `0` |
| `--block-title-radius` | The corner radius of the title of a form element (e.g. textbox). | `none` |
| `--block-title-text-size` | The text size of the title of a form element (e.g. textbox). | `*text_md` |
| `--block-title-text-weight` | The text weight of the title of a form element (e.g. textbox). | `400` |
| `--container-radius` | The corner radius of a layout component that holds other content. | `*radius_sm` |
| `--form-gap-width` | The border gap between form elements, (e.g. consecutive textboxes). | `0px` |
| `--layout-gap` | The gap between items within a row or column. | `*spacing_xxl` |
| `--panel-background-fill` | The background of a panel. | `*background_fill_secondary` |
| `--panel-background-fill-dark` | The background of a panel in dark mode. | `*background_fill_secondary` |
| `--panel-border-color` | The border color of a panel. | `*border_color_primary` |
| `--panel-border-color-dark` | The border color of a panel in dark mode. | `*border_color_primary` |
| `--panel-border-width` | The border width of a panel. | `0` |
| `--panel-border-width-dark` | The border width of a panel in dark mode. |  |
| `--section-header-text-size` | The text size of a section header (e.g. tab name). | `*text_md` |
| `--section-header-text-weight` | The text weight of a section header (e.g. tab name). | `400` |

## Component Atoms

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--accordion-text-color` | The body text color in the accordion. | `*body_text_color` |
| `--accordion-text-color-dark` | The body text color in the accordion in dark mode. | `*body_text_color` |
| `--table-text-color` | The body text color in the table. | `*body_text_color` |
| `--table-text-color-dark` | The body text color in the table in dark mode. | `*body_text_color` |
| `--checkbox-background-color` | The background of a checkbox square or radio circle. | `*background_fill_primary` |
| `--chatbot-text-size` | The text size of the chatbot text. | `*text_lg` |
| `--checkbox-background-color-dark` | The background of a checkbox square or radio circle in dark mode. | `*neutral_800` |
| `--checkbox-background-color-focus` | The background of a checkbox square or radio circle when focused. | `*checkbox_background_color` |
| `--checkbox-background-color-focus-dark` | The background of a checkbox square or radio circle when focused in dark mode. | `*checkbox_background_color` |
| `--checkbox-background-color-hover` | The background of a checkbox square or radio circle when hovered over. | `*checkbox_background_color` |
| `--checkbox-background-color-hover-dark` | The background of a checkbox square or radio circle when hovered over in dark mode. | `*checkbox_background_color` |
| `--checkbox-background-color-selected` | The background of a checkbox square or radio circle when selected. | `*color_accent` |
| `--checkbox-background-color-selected-dark` | The background of a checkbox square or radio circle when selected in dark mode. | `*color_accent` |
| `--checkbox-border-color` | The border color of a checkbox square or radio circle. | `*neutral_300` |
| `--checkbox-border-color-dark` | The border color of a checkbox square or radio circle in dark mode. | `*neutral_700` |
| `--checkbox-border-color-focus` | The border color of a checkbox square or radio circle when focused. | `*color_accent` |
| `--checkbox-border-color-focus-dark` | The border color of a checkbox square or radio circle when focused in dark mode. | `*color_accent` |
| `--checkbox-border-color-hover` | The border color of a checkbox square or radio circle when hovered over. | `*neutral_300` |
| `--checkbox-border-color-hover-dark` | The border color of a checkbox square or radio circle when hovered over in dark mode. | `*neutral_600` |
| `--checkbox-border-color-selected` | The border color of a checkbox square or radio circle when selected. | `*color_accent` |
| `--checkbox-border-color-selected-dark` | The border color of a checkbox square or radio circle when selected in dark mode. | `*color_accent` |
| `--checkbox-border-radius` | The corner radius of a checkbox square. | `*radius_sm` |
| `--checkbox-border-width` | The border width of a checkbox square or radio circle. | `*input_border_width` |
| `--checkbox-border-width-dark` | The border width of a checkbox square or radio circle in dark mode. | `*input_border_width` |
| `--checkbox-check` | The checkmark visual of a checkbox square. | `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` |
| `--radio-circle` | The circle visual of a radio circle. | `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")` |
| `--checkbox-shadow` | The shadow of a checkbox square or radio circle. | `*input_shadow` |
| `--checkbox-label-background-fill` | The background of the surrounding button of a checkbox or radio element. | `*button_secondary_background_fill` |
| `--checkbox-label-background-fill-dark` | The background of the surrounding button of a checkbox or radio element in dark mode. | `*button_secondary_background_fill` |
| `--checkbox-label-background-fill-hover` | The background of the surrounding button of a checkbox or radio element when hovered over. | `*button_secondary_background_fill_hover` |
| `--checkbox-label-background-fill-hover-dark` | The background of the surrounding button of a checkbox or radio element when hovered over in dark mode. | `*button_secondary_background_fill_hover` |
| `--checkbox-label-background-fill-selected` | The background of the surrounding button of a checkbox or radio element when selected. | `*checkbox_label_background_fill` |
| `--checkbox-label-background-fill-selected-dark` | The background of the surrounding button of a checkbox or radio element when selected in dark mode. | `*checkbox_label_background_fill` |
| `--checkbox-label-border-color` | The border color of the surrounding button of a checkbox or radio element. | `*border_color_primary` |
| `--checkbox-label-border-color-dark` | The border color of the surrounding button of a checkbox or radio element in dark mode. | `*border_color_primary` |
| `--checkbox-label-border-color-hover` | The border color of the surrounding button of a checkbox or radio element when hovered over. | `*checkbox_label_border_color` |
| `--checkbox-label-border-color-hover-dark` | The border color of the surrounding button of a checkbox or radio element when hovered over in dark mode. | `*checkbox_label_border_color` |
| `--checkbox-label-border-color-selected` | The border color of the surrounding button of a checkbox or radio element when selected. | `*checkbox_label_border_color` |
| `--checkbox-label-border-color-selected-dark` | The border color of the surrounding button of a checkbox or radio element when selected in dark mode. | `*checkbox_label_border_color` |
| `--checkbox-label-border-width` | The border width of the surrounding button of a checkbox or radio element. | `*input_border_width` |
| `--checkbox-label-border-width-dark` | The border width of the surrounding button of a checkbox or radio element in dark mode. | `*input_border_width` |
| `--checkbox-label-gap` | The gap consecutive checkbox or radio elements. | `*spacing_lg` |
| `--checkbox-label-padding` | The padding of the surrounding button of a checkbox or radio element. | `*spacing_md calc(2 * *spacing_md)` |
| `--checkbox-label-shadow` | The shadow of the surrounding button of a checkbox or radio element. | `none` |
| `--checkbox-label-text-size` | The text size of the label accompanying a checkbox or radio element. | `*text_md` |
| `--checkbox-label-text-weight` | The text weight of the label accompanying a checkbox or radio element. | `400` |
| `--checkbox-label-text-color` | The text color of the label accompanying a checkbox or radio element. | `*body_text_color` |
| `--checkbox-label-text-color-dark` | The text color of the label accompanying a checkbox or radio element in dark mode. | `*body_text_color` |
| `--checkbox-label-text-color-selected` | The text color of the label accompanying a checkbox or radio element when selected. | `*checkbox_label_text_color` |
| `--checkbox-label-text-color-selected-dark` | The text color of the label accompanying a checkbox or radio element when selected in dark mode. | `*checkbox_label_text_color` |
| `--error-background-fill` | The background of an error message. | `#fef2f2` |
| `--error-background-fill-dark` | The background of an error message in dark mode. | `*background_fill_primary` |
| `--error-border-color` | The border color of an error message. | `#b91c1c` |
| `--error-border-color-dark` | The border color of an error message in dark mode. | `#ef4444` |
| `--error-border-width` | The border width of an error message. | `1px` |
| `--error-border-width-dark` | The border width of an error message in dark mode. |  |
| `--error-text-color` | The text color of an error message. | `#b91c1c` |
| `--error-text-color-dark` | The text color of an error message in dark mode. | `#fef2f2` |
| `--error-icon-color` |  | `#b91c1c` |
| `--error-icon-color-dark` |  | `#ef4444` |
| `--input-background-fill` | The background of an input field. | `*neutral_100` |
| `--input-background-fill-dark` | The background of an input field in dark mode. | `*neutral_700` |
| `--input-background-fill-focus` | The background of an input field when focused. | `*input_background_fill` |
| `--input-background-fill-focus-dark` | The background of an input field when focused in dark mode. |  |
| `--input-background-fill-hover` | The background of an input field when hovered over. | `*input_background_fill` |
| `--input-background-fill-hover-dark` | The background of an input field when hovered over in dark mode. | `*input_background_fill` |
| `--input-border-color` | The border color of an input field. | `*border_color_primary` |
| `--input-border-color-dark` | The border color of an input field in dark mode. | `*border_color_primary` |
| `--input-border-color-focus` | The border color of an input field when focused. | `*secondary_300` |
| `--input-border-color-focus-dark` | The border color of an input field when focused in dark mode. | `*neutral_700` |
| `--input-border-color-hover` | The border color of an input field when hovered over. | `*input_border_color` |
| `--input-border-color-hover-dark` | The border color of an input field when hovered over in dark mode. | `*input_border_color` |
| `--input-border-width` | The border width of an input field. | `0px` |
| `--input-border-width-dark` | The border width of an input field in dark mode. |  |
| `--input-padding` | The padding of an input field. | `*spacing_xl` |
| `--input-placeholder-color` | The placeholder text color of an input field. | `*neutral_400` |
| `--input-placeholder-color-dark` | The placeholder text color of an input field in dark mode. | `*neutral_500` |
| `--input-radius` | The corner radius of an input field. | `*radius_sm` |
| `--input-shadow` | The shadow of an input field. | `none` |
| `--input-shadow-dark` | The shadow of an input field in dark mode. |  |
| `--input-shadow-focus` | The shadow of an input field when focused. | `*input_shadow` |
| `--input-shadow-focus-dark` | The shadow of an input field when focused in dark mode. |  |
| `--input-text-size` | The text size of an input field. | `*text_md` |
| `--input-text-weight` | The text weight of an input field. | `400` |
| `--loader-color` | The color of the loading animation while a request is pending. | `*color_accent` |
| `--loader-color-dark` | The color of the loading animation while a request is pending in dark mode. |  |
| `--slider-color` | The color of the slider in a range element. | `*color_accent` |
| `--slider-color-dark` | The color of the slider in a range element in dark mode. |  |
| `--stat-background-fill` | The background used for stats visuals (e.g. confidence bars in label). | `*primary_300` |
| `--stat-background-fill-dark` | The background used for stats visuals (e.g. confidence bars in label) in dark mode. | `*primary_500` |
| `--table-border-color` | The border color of a table. | `*neutral_300` |
| `--table-border-color-dark` | The border color of a table in dark mode. | `*neutral_700` |
| `--table-even-background-fill` | The background of even rows in a table. | `white` |
| `--table-even-background-fill-dark` | The background of even rows in a table in dark mode. | `*neutral_950` |
| `--table-odd-background-fill` | The background of odd rows in a table. | `*neutral_50` |
| `--table-odd-background-fill-dark` | The background of odd rows in a table in dark mode. | `*neutral_900` |
| `--table-radius` | The corner radius of a table. | `*radius_sm` |
| `--table-row-focus` | The background of a focused row in a table. | `*color_accent_soft` |
| `--table-row-focus-dark` | The background of a focused row in a table in dark mode. | `*color_accent_soft` |

## Buttons

| CSS Variable | Description | Default |
| --- | --- | --- |
| `--button-border-width` | The border width of a button. | `*input_border_width` |
| `--button-border-width-dark` | The border width of a button in dark mode. |  |
| `--button-transform-hover` | The transform animation of a button on hover. | `none` |
| `--button-transform-active` | The transform animation of a button when pressed. | `none` |
| `--button-transition` | The transition animation duration of a button between regular, hover, and focused states. | `all 0.2s ease` |
| `--button-large-padding` | The padding of a button with the default "large" size. | `*spacing_lg calc(2 * *spacing_lg)` |
| `--button-large-radius` | The corner radius of a button with the default "large" size. | `*radius_md` |
| `--button-large-text-size` | The text size of a button with the default "large" size. | `*text_lg` |
| `--button-large-text-weight` | The text weight of a button with the default "large" size. | `600` |
| `--button-small-padding` | The padding of a button set to "small" size. | `*spacing_sm calc(1.5 * *spacing_sm)` |
| `--button-small-radius` | The corner radius of a button set to "small" size. | `*radius_md` |
| `--button-small-text-size` | The text size of a button set to "small" size. | `*text_sm` |
| `--button-small-text-weight` | The text weight of a button set to "small" size. | `400` |
| `--button-medium-padding` | The padding of a button set to "medium" size. | `*spacing_md calc(2 * *spacing_md)` |
| `--button-medium-radius` | The corner radius of a button set to "medium" size. | `*radius_md` |
| `--button-medium-text-size` | The text size of a button set to "medium" size. | `*text_md` |
| `--button-medium-text-weight` | The text weight of a button set to "medium" size. | `600` |
| `--button-primary-background-fill` | The background of a button of "primary" variant. | `*primary_500` |
| `--button-primary-background-fill-dark` | The background of a button of "primary" variant in dark mode. | `*primary_600` |
| `--button-primary-background-fill-hover` | The background of a button of "primary" variant when hovered over. | `*primary_600` |
| `--button-primary-background-fill-hover-dark` | The background of a button of "primary" variant when hovered over in dark mode. | `*primary_700` |
| `--button-primary-border-color` | The border color of a button of "primary" variant. | `*primary_500` |
| `--button-primary-border-color-dark` | The border color of a button of "primary" variant in dark mode. | `*primary_600` |
| `--button-primary-border-color-hover` | The border color of a button of "primary" variant when hovered over. | `*primary_500` |
| `--button-primary-border-color-hover-dark` | The border color of a button of "primary" variant when hovered over in dark mode. | `*primary_500` |
| `--button-primary-text-color` | The text color of a button of "primary" variant. | `white` |
| `--button-primary-text-color-dark` | The text color of a button of "primary" variant in dark mode. | `white` |
| `--button-primary-text-color-hover` | The text color of a button of "primary" variant when hovered over. | `*button_primary_text_color` |
| `--button-primary-text-color-hover-dark` | The text color of a button of "primary" variant when hovered over in dark mode. | `*button_primary_text_color` |
| `--button-primary-shadow` | The shadow under a primary button. | `none` |
| `--button-primary-shadow-hover` | The shadow under a primary button when hovered over. | `*button_primary_shadow` |
| `--button-primary-shadow-active` | The shadow under a primary button when pressed. | `*button_primary_shadow` |
| `--button-primary-shadow-dark` | The shadow under a primary button in dark mode. |  |
| `--button-primary-shadow-hover-dark` | The shadow under a primary button when hovered over in dark mode. | `*button_primary_shadow` |
| `--button-primary-shadow-active-dark` | The shadow under a primary button when pressed in dark mode. | `*button_primary_shadow` |
| `--button-secondary-background-fill` | The background of a button of default "secondary" variant. | `*neutral_200` |
| `--button-secondary-background-fill-dark` | The background of a button of default "secondary" variant in dark mode. | `*neutral_600` |
| `--button-secondary-background-fill-hover` | The background of a button of default "secondary" variant when hovered over. | `*neutral_300` |
| `--button-secondary-background-fill-hover-dark` | The background of a button of default "secondary" variant when hovered over in dark mode. | `*neutral_700` |
| `--button-secondary-border-color` | The border color of a button of default "secondary" variant. | `*neutral_200` |
| `--button-secondary-border-color-dark` | The border color of a button of default "secondary" variant in dark mode. | `*neutral_600` |
| `--button-secondary-border-color-hover` | The border color of a button of default "secondary" variant when hovered over. | `*neutral_200` |
| `--button-secondary-border-color-hover-dark` | The border color of a button of default "secondary" variant when hovered over in dark mode. | `*neutral_500` |
| `--button-secondary-text-color` | The text color of a button of default "secondary" variant. | `black` |
| `--button-secondary-text-color-dark` | The text color of a button of default "secondary" variant in dark mode. | `white` |
| `--button-secondary-text-color-hover` | The text color of a button of default "secondary" variant when hovered over. | `*button_secondary_text_color` |
| `--button-secondary-text-color-hover-dark` | The text color of a button of default "secondary" variant when hovered over in dark mode. | `*button_secondary_text_color` |
| `--button-secondary-shadow` | The shadow under a secondary button. | `*button_primary_shadow` |
| `--button-secondary-shadow-hover` | The shadow under a secondary button when hovered over. | `*button_secondary_shadow` |
| `--button-secondary-shadow-active` | The shadow under a secondary button when pressed. | `*button_secondary_shadow` |
| `--button-secondary-shadow-dark` | The shadow under a secondary button in dark mode. |  |
| `--button-secondary-shadow-hover-dark` | The shadow under a secondary button when hovered over in dark mode. | `*button_secondary_shadow` |
| `--button-secondary-shadow-active-dark` | The shadow under a secondary button when pressed in dark mode. | `*button_secondary_shadow` |
| `--button-cancel-background-fill` | The background of a button of "cancel" variant. | `*button_secondary_background_fill` |
| `--button-cancel-background-fill-dark` | The background of a button of "cancel" variant in dark mode. | `*button_secondary_background_fill` |
| `--button-cancel-background-fill-hover` | The background of a button of "cancel" variant when hovered over. | `*button_secondary_background_fill_hover` |
| `--button-cancel-background-fill-hover-dark` | The background of a button of "cancel" variant when hovered over in dark mode. | `*button_secondary_background_fill_hover` |
| `--button-cancel-border-color` | The border color of a button of "cancel" variant. | `*button_secondary_border_color` |
| `--button-cancel-border-color-dark` | The border color of a button of "cancel" variant in dark mode. | `*button_secondary_border_color` |
| `--button-cancel-border-color-hover` | The border color of a button of "cancel" variant when hovered over. | `*button_secondary_border_color_hover` |
| `--button-cancel-border-color-hover-dark` | The border color of a button of "cancel" variant when hovered over in dark mode. | `*button_secondary_border_color_hover` |
| `--button-cancel-text-color` | The text color of a button of "cancel" variant. | `*button_secondary_text_color` |
| `--button-cancel-text-color-dark` | The text color of a button of "cancel" variant in dark mode. | `*button_secondary_text_color` |
| `--button-cancel-text-color-hover` | The text color of a button of "cancel" variant when hovered over. | `*button_secondary_text_color_hover` |
| `--button-cancel-text-color-hover-dark` | The text color of a button of "cancel" variant when hovered over in dark mode. | `white` |
| `--button-cancel-shadow` | The shadow under a button of "cancel" variant. | `*button_secondary_shadow` |
| `--button-cancel-shadow-hover` | The shadow under a button of "cancel" variant when hovered over. | `*button_secondary_shadow_hover` |
| `--button-cancel-shadow-active` | The shadow under a button of "cancel" variant when pressed. | `*button_secondary_shadow_active` |
| `--button-cancel-shadow-dark` | The shadow under a button of "cancel" variant in dark mode. | `*button_secondary_shadow` |
| `--button-cancel-shadow-hover-dark` | The shadow under a button of "cancel" variant when hovered over in dark mode. | `*button_secondary_shadow_hover` |
| `--button-cancel-shadow-active-dark` | The shadow under a button of "cancel" variant when pressed in dark mode. | `*button_secondary_shadow_active` |
<!-- CSS_VARS_TABLE_END -->
