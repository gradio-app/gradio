import { AudioInput, AudioInputExample } from './interfaces/input/audio';
import { CheckboxGroupInput, CheckboxGroupInputExample } from './interfaces/input/checkbox_group';
import { CheckboxInput, CheckboxInputExample } from './interfaces/input/checkbox';
import { DataframeInput, DataframeInputExample } from './interfaces/input/dataframe';
import { DropdownInput, DropdownInputExample } from './interfaces/input/dropdown';
import { FileInput, FileInputExample } from './interfaces/input/file';
import { ImageInput, ImageInputExample } from './interfaces/input/image';
import { NumberInput, NumberInputExample } from './interfaces/input/number';
import { RadioInput, RadioInputExample } from './interfaces/input/radio';
import { SliderInput, SliderInputExample } from './interfaces/input/slider';
import { TextboxInput, TextboxInputExample } from './interfaces/input/textbox';
import { VideoInput, VideoInputExample } from './interfaces/input/video';

import { AudioOutput, AudioOutputExample } from './interfaces/output/audio';
import { CarouselOutput, CarouselOutputExample } from './interfaces/output/carousel';
import { DataframeOutput, DataframeOutputExample } from './interfaces/output/dataframe';
import { FileOutput, FileOutputExample } from './interfaces/output/file';
import { HighlightedTextOutput, HighlightedTextOutputExample } from './interfaces/output/highlighted_text';
import { HTMLOutput, HTMLOutputExample } from './interfaces/output/html';
import { ImageOutput, ImageOutputExample } from './interfaces/output/image';
import { JSONOutput, JSONOutputExample } from './interfaces/output/json';
import { KeyValuesOutput, KeyValuesOutputExample } from './interfaces/output/key_values';
import { LabelOutput, LabelOutputExample } from './interfaces/output/label';
import { TextboxOutput, TextboxOutputExample } from './interfaces/output/textbox';
import { VideoOutput, VideoOutputExample } from './interfaces/output/video';

let input_component_map = {
  "audio": [AudioInput, AudioInputExample],
  "checkboxgroup": [CheckboxGroupInput, CheckboxGroupInputExample],
  "checkbox": [CheckboxInput, CheckboxInputExample],
  "dataframe": [DataframeInput, DataframeInputExample],
  "dropdown": [DropdownInput, DropdownInputExample],
  "file": [FileInput, FileInputExample],
  "image": [ImageInput, ImageInputExample],
  "number": [NumberInput, NumberInputExample],
  "radio": [RadioInput, RadioInputExample],
  "slider": [SliderInput, SliderInputExample],
  "textbox": [TextboxInput, TextboxInputExample],
  "video": [VideoInput, VideoInputExample],
}
let output_component_map = {
  "audio": [AudioOutput, AudioOutputExample],
  "carousel": [CarouselOutput, CarouselOutputExample],
  "dataframe": [DataframeOutput, DataframeOutputExample],
  "file": [FileOutput, FileOutputExample],
  "highlightedtext": [HighlightedTextOutput, HighlightedTextOutputExample],
  "html": [HTMLOutput, HTMLOutputExample],
  "image": [ImageOutput, ImageOutputExample],
  "json": [JSONOutput, JSONOutputExample],
  "keyvalues": [KeyValuesOutput, KeyValuesOutputExample],
  "label": [LabelOutput, LabelOutputExample],
  "textbox": [TextboxOutput, TextboxOutputExample],
  "video": [VideoOutput, VideoOutputExample],
}


export {input_component_map, output_component_map};