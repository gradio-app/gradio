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
import { VideoOutput, VideoOutputExample } from "./components/output/video";

let input_component_map = {
  audio: [AudioInput, AudioInputExample],
  checkboxgroup: [CheckboxGroupInput, CheckboxGroupInputExample],
  checkbox: [CheckboxInput, CheckboxInputExample],
  dataframe: [DataframeInput, DataframeInputExample],
  dropdown: [DropdownInput, DropdownInputExample],
  file: [FileInput, FileInputExample],
  image: [ImageInput, ImageInputExample],
  number: [NumberInput, NumberInputExample],
  radio: [RadioInput, RadioInputExample],
  slider: [SliderInput, SliderInputExample],
  textbox: [TextboxInput, TextboxInputExample],
  video: [VideoInput, VideoInputExample]
};
let output_component_map = {
  audio: [AudioOutput, AudioOutputExample],
  carousel: [CarouselOutput, CarouselOutputExample],
  dataframe: [DataframeOutput, DataframeOutputExample],
  file: [FileOutput, FileOutputExample],
  highlightedtext: [HighlightedTextOutput, HighlightedTextOutputExample],
  html: [HTMLOutput, HTMLOutputExample],
  image: [ImageOutput, ImageOutputExample],
  json: [JSONOutput, JSONOutputExample],
  keyvalues: [KeyValuesOutput, KeyValuesOutputExample],
  label: [LabelOutput, LabelOutputExample],
  textbox: [TextboxOutput, TextboxOutputExample],
  video: [VideoOutput, VideoOutputExample]
};

for (let component_map of [input_component_map, output_component_map]) {
  for (let [key, components] of Object.entries(component_map)) {
    let component = components[0];
    component_map[key][0] = React.memo(component, component.memo);
  }
}

export { input_component_map, output_component_map };
