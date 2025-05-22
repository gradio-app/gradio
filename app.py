from enum import Enum
import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import gradio as gr
import pandas as pd


# Function to update the state with the new dataframe
def update_dataframe(new_df, state):
    state = new_df  # Update the state with the new dataframe
    return state, new_df  # Return both the updated state and the dataframe to re-render


class BusProvider(Enum):
    EGED = "EGED"
    DAN = "DAN"


BusIdsByProvider = Dict[BusProvider, List[int]]


class BusRules(BaseModel):
    disabled_buses: BusIdsByProvider = {}
    express_buses: BusIdsByProvider = {}
    accessible_buses: BusIdsByProvider = {}


css = """
 .dataframe {
        overflow-x: hidden; /* Hide vertical scrollbar */
    }

.generating {
    border: none;
}
"""
with gr.Blocks(css=css) as demo:
    config_state = gr.State(
        BusRules(
            disabled_buses={
                BusProvider.DAN: [1, 2, 3],
            },
        )
    )

    gr.Button()

    BUS_COUNTS_BY_PROVIDER = {
        BusProvider.DAN: 10,
        BusProvider.EGED: 23,
    }

    selected_bus_provider_state = gr.State(BusProvider.EGED)

    def create_bus_ids_list(
        bus_provider: BusProvider
    ) -> List[str]:
        return [
            f"{id + 1}" for id in range(BUS_COUNTS_BY_PROVIDER[bus_provider])
        ]
    def create_bool_list(
        bus_provider: BusProvider, bus_ids: Optional[List[int]]
    ) -> List[bool]:
        return [
            id + 1 in (bus_ids or []) for id in range(BUS_COUNTS_BY_PROVIDER[bus_provider])
        ]

    def update_selected_mode(new_value: pd.DataFrame, bus_provider: BusProvider, config_value: BusRules):
        print(new_value)
        print(config_value)
        next_config_value = config_value.model_copy()
        next_config_value.disabled_buses[bus_provider] = [i + 1 for i, val in enumerate(new_value.to_numpy()) if str(val[1]).lower() == "true"]
        next_config_value.express_buses[bus_provider] = [i + 1 for i, val in enumerate(new_value.to_numpy()) if str(val[2]).lower() == "true"]
        next_config_value.accessible_buses[bus_provider] = [i + 1 for i, val in enumerate(new_value.to_numpy()) if str(val[3]).lower() == "true"]
        return next_config_value

    @gr.render(inputs=[config_state, selected_bus_provider_state])
    def render_dataframe(config_value: BusRules, selected_bus_provider: BusProvider):
        frame = pd.DataFrame(
            data={
                "Bus ID": create_bus_ids_list(bus_provider=selected_bus_provider),
                "Is disabled?": create_bool_list(
                    bus_provider=selected_bus_provider,
                    bus_ids=config_value.disabled_buses.get(selected_bus_provider),
                ),
                "Is express?": create_bool_list(
                    bus_provider=selected_bus_provider,
                    bus_ids=config_value.express_buses.get(selected_bus_provider),
                ),
                "Is accessible?": create_bool_list(
                    bus_provider=selected_bus_provider,
                    bus_ids=config_value.accessible_buses.get(selected_bus_provider),
                ),
            },
        )
        df = gr.Dataframe(
            bool_input="checkbox",
            datatype=["str", "bool", "bool", "bool"],
            static_columns=[0],
            value=frame,
            interactive=True,
            max_height=5000
        )
        df.input(update_selected_mode, inputs=[df, selected_bus_provider_state, config_state], outputs=[config_state])

    # def render_data_frame(data_frame_value):
    #    df.select(lambda x: update_dataframe(x, data_frame_state), inputs=df, outputs=[data_frame_state])
    # @df.change(inputs=[df, data_frame_state], outputs=[data_frame_state])
    # def handle_change(dataframe_value, data_frame_value):
    #    print(dataframe_value, data_frame_value)
    #    return data_frame_value

    @gr.render(inputs=[config_state])
    def generate_data(config_value: BusRules):
       gr.JSON(config_value.model_dump_json(), show_indices=False)

if __name__ == "__main__":
    demo.launch()
