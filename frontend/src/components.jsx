import React from "react";

import { AudioInput, AudioInputExample } from "./components/input/audio";
import {
  CheckboxGroupInput,
  CheckboxGroupInputExample
} from "./components/input/checkbox_group";
import {
  CheckboxInput,
  CheckboxInputExample
} from "./components/input/checkbox";
import {
  DataframeInput,
  DataframeInputExample
} from "./components/input/dataframe";
import {
  DropdownInput,
  DropdownInputExample
} from "./components/input/dropdown";
import { FileInput, FileInputExample } from "./components/input/file";
import { ImageInput, ImageInputExample } from "./components/input/image";
import { NumberInput, NumberInputExample } from "./components/input/number";
import { RadioInput, RadioInputExample } from "./components/input/radio";
import { SliderInput, SliderInputExample } from "./components/input/slider";
import { TextboxInput, TextboxInputExample } from "./components/input/textbox";
import {
  TimeseriesInput,
  TimeseriesInputExample
} from "./components/input/timeseries";
import { VideoInput, VideoInputExample } from "./components/input/video";

import { AudioOutput, AudioOutputExample } from "./components/output/audio";
import {
  CarouselOutput,
  CarouselOutputExample
} from "./components/output/carousel";
import {
  DataframeOutput,
  DataframeOutputExample
} from "./components/output/dataframe";
import { FileOutput, FileOutputExample } from "./components/output/file";
import {
  HighlightedTextOutput,
  HighlightedTextOutputExample
} from "./components/output/highlighted_text";
import { HTMLOutput, HTMLOutputExample } from "./components/output/html";
import { ImageOutput, ImageOutputExample } from "./components/output/image";
import { JSONOutput, JSONOutputExample } from "./components/output/json";
import {
  KeyValuesOutput,
  KeyValuesOutputExample
} from "./components/output/key_values";
import { LabelOutput, LabelOutputExample } from "./components/output/label";
import {
  TextboxOutput,
  TextboxOutputExample
} from "./components/output/textbox";
import {
  TimeseriesOutput,
  TimeseriesOutputExample
} from "./components/output/timeseries";
import { VideoOutput, VideoOutputExample } from "./components/output/video";

let input_component_set = [
  {
    name: "audio",
    component: AudioInput,
    memoized_component: null,
    example_component: AudioInputExample
  },
  {
    name: "checkboxgroup",
    component: CheckboxGroupInput,
    memoized_component: null,
    example_component: CheckboxGroupInputExample
  },
  {
    name: "checkbox",
    component: CheckboxInput,
    memoized_component: null,
    example_component: CheckboxInputExample
  },
  {
    name: "dataframe",
    component: DataframeInput,
    memoized_component: null,
    example_component: DataframeInputExample
  },
  {
    name: "dropdown",
    component: DropdownInput,
    memoized_component: null,
    example_component: DropdownInputExample
  },
  {
    name: "file",
    component: FileInput,
    memoized_component: null,
    example_component: FileInputExample
  },
  {
    name: "image",
    component: ImageInput,
    memoized_component: null,
    example_component: ImageInputExample
  },
  {
    name: "number",
    component: NumberInput,
    memoized_component: null,
    example_component: NumberInputExample
  },
  {
    name: "radio",
    component: RadioInput,
    memoized_component: null,
    example_component: RadioInputExample
  },
  {
    name: "slider",
    component: SliderInput,
    memoized_component: null,
    example_component: SliderInputExample
  },
  {
    name: "textbox",
    component: TextboxInput,
    memoized_component: null,
    example_component: TextboxInputExample
  },
  {
    name: "timeseries",
    component: TimeseriesInput,
    memoized_component: null,
    example_component: TimeseriesInputExample
  },
  { name: "video", component: VideoInput, example_component: VideoInputExample }
];
let output_component_set = [
  {
    name: "audio",
    component: AudioOutput,
    memoized_component: null,
    example_component: AudioOutputExample
  },
  {
    name: "carousel",
    component: CarouselOutput,
    memoized_component: null,
    example_component: CarouselOutputExample
  },
  {
    name: "dataframe",
    component: DataframeOutput,
    memoized_component: null,
    example_component: DataframeOutputExample
  },
  {
    name: "file",
    component: FileOutput,
    memoized_component: null,
    example_component: FileOutputExample
  },
  {
    name: "highlightedtext",
    component: HighlightedTextOutput,
    memoized_component: null,
    example_component: HighlightedTextOutputExample
  },
  {
    name: "html",
    component: HTMLOutput,
    memoized_component: null,
    example_component: HTMLOutputExample
  },
  {
    name: "image",
    component: ImageOutput,
    memoized_component: null,
    example_component: ImageOutputExample
  },
  {
    name: "json",
    component: JSONOutput,
    memoized_component: null,
    example_component: JSONOutputExample
  },
  {
    name: "keyvalues",
    component: KeyValuesOutput,
    memoized_component: null,
    example_component: KeyValuesOutputExample
  },
  {
    name: "label",
    component: LabelOutput,
    memoized_component: null,
    example_component: LabelOutputExample
  },
  {
    name: "textbox",
    component: TextboxOutput,
    memoized_component: null,
    example_component: TextboxOutputExample
  },
  {
    name: "timeseries",
    component: TimeseriesOutput,
    memoized_component: null,
    example_component: TimeseriesOutputExample
  },
  {
    name: "video",
    component: VideoOutput,
    memoized_component: null,
    example_component: VideoOutputExample
  }
];

for (let component_set of [input_component_set, output_component_set]) {
  for (let component_data of component_set) {
    component_data.memoized_component = React.memo(
      component_data.component,
      component_data.component.memo
    );
  }
}

export { input_component_set, output_component_set };
