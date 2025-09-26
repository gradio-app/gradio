from __future__ import annotations

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.component_meta import ComponentMeta
from gradio.events import Events
from gradio.i18n import I18nData


@document()
class Walkthrough(BlockContext, metaclass=ComponentMeta):
    """
    Walkthrough is a layout element within Blocks that can contain multiple "Step" Components, which can be used to create a step-by-step workflow.
    Example:
        with gr.Walkthrough(selected=1) as walkthrough:
            with gr.Step("Step 1", id=1):
                btn = gr.Button("go to Step 2")
                btn.click(lambda: gr.Walkthrough(selected=2), outputs=walkthrough)
            with gr.Step("Step 2", id=2):
                txt = gr.Textbox("Welcome to Step 2")

    Guides: controlling-layout
    Demos: walkthrough
    """

    EVENTS = [Events.change, Events.select]

    def __init__(
        self,
        *,
        selected: int | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = None,
    ):
        """
        Parameters:
            selected: The currently selected step. Must be a number corresponding to the step number. Defaults to the first step.
            visible: If False, Walkthrough will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
        """
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
        self.selected = selected

    def get_block_name(self):
        return "walkthrough"


@document()
class Step(BlockContext, metaclass=ComponentMeta):
    """
    Step is a layout element. A step is a single step in a step-by-step workflow.
    """

    EVENTS = [Events.select]

    def __init__(
        self,
        label: str | I18nData | None = None,
        visible: bool = True,
        interactive: bool = True,
        *,
        id: int | None = None,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        scale: int | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = None,
    ):
        """
        Parameters:
            label: The visual label for the step
            id: An optional numeric identifier for the step, required if you wish to control the selected step from a predict function. Must be a number.
            elem_id: An optional string that is assigned as the id of the <div> containing the contents of the Step layout. The same string followed by "-button" is attached to the Step button. Can be used for targeting CSS styles.
            elem_classes: An optional string or list of strings that are assigned as the class of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, this layout will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            scale: relative size compared to adjacent elements. 1 or greater indicates the Step will expand in size.
            visible: If False, Step will be hidden.
            interactive: If False, Step will not be clickable.
        """
        BlockContext.__init__(
            self,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
        self.label = label
        self.id = id
        self.visible = visible
        self.scale = scale
        self.interactive = interactive

    def get_expected_parent(self) -> type[Walkthrough]:
        return Walkthrough

    def get_block_name(self):
        return "walkthroughstep"
