import React from 'react';
import classNames from "classnames";

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

import logo_loading from './static/img/logo_loading.jpg'
import logo_error from './static/img/logo_error.png'
import('./themes/defaults.scss');
import('./themes/huggingface.scss');

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

export class GradioInterface extends React.Component {
  constructor(props) {
    super(props);
    this.clear = this.clear.bind(this);
    this.submit = this.submit.bind(this);
    this.flag = this.flag.bind(this);
    this.handleExampleChange = this.handleExampleChange.bind(this);
    this.state = this.get_default_state();
    this.state["examples_page"] = 0;
    this.examples_dir = process.env.REACT_APP_BACKEND_URL + (this.props.examples_dir === null ? "/file" + this.props.examples_dir + (this.props.examples_dir.endswith("/") ? "" : "/") : "/file");
  }
  get_default_state() {
    let state = {};
    for (let [i, component] of this.props.input_components.entries()) {
      state[i] = component.default !== undefined ? component.default : null;
    }
    let index_start = this.props.input_components.length;
    for (let [i, component] of this.props.output_components.entries()) {
      state[index_start + i] = component.default !== undefined ? component.default : null;
    }
    state["submitting"] = false;
    state["error"] = false;
    state["complete"] = false;
    state["just_flagged"] = false;
    state["has_changed"] = false;
    state["example_id"] = null;
    return state;
  }
  clear() {
    this.setState(this.get_default_state());
  }
  submit() {
    let input_state = [];
    for (let i = 0; i < this.props.input_components.length; i++) {
      if (this.state[i] === null) {
        return;
      }
      input_state[i] = this.state[i];
    }
    this.setState({ "submitting": true, "has_changed": false, "error": false });
    this.props.fn(input_state, "predict").then((output) => {
      let index_start = this.props.input_components.length;
      for (let [i, value] of output["data"].entries()) {
        this.setState({ [index_start + i]: value });
      }
      this.setState({ "submitting": false, "complete": true });
      if (this.state.has_changed) {
        this.submit();
      }
    }).catch(e => {
      console.error(e);
      this.setState({
        "error": true,
        "submitting": false
      });
    });
  }
  flag() {
    if (!this.state.complete) {
      return;
    }
    let component_state = { "input_data": [], "output_data": [] };
    for (let i = 0; i < this.props.input_components.length; i++) {
      component_state["input_data"].push(this.state[i]);
    }
    for (let i = 0; i < this.props.output_components.length; i++) {
      component_state["output_data"].push(this.state[this.props.input_components.length + i]);
    }
    this.setState({ "just_flagged": true });
    window.setTimeout(() => {
      this.setState({ "just_flagged": false });
    }, 1000)
    this.props.fn(component_state, "flag");
  }
  handleChange(_id, value) {
    let state_change = { [_id]: value, "has_changed": true };
    if (this.props.live && !(this.state.submitting)) {
      this.setState(state_change, this.submit);
    } else {
      this.setState(state_change);
    }
  }
  handleExampleChange(example_id) {
    let state_change = {};
    this.setState({ "example_id": example_id });
    for (let [i, item] of this.props.examples[example_id].entries()) {
      let ExampleComponent = i < this.props.input_components.length ? input_component_map[this.props.input_components[i].name][1] : output_component_map[this.props.output_components[i - this.props.input_components.length].name][1]
      state_change[i] = ExampleComponent.preprocess(item, this.examples_dir).then((data) => {
        this.handleChange(i, data);
      });
    }
  }
  render() {
    let title = this.props.title ? <h1 className="title">{this.props.title}</h1> : false;
    let description = this.props.description ? <p className="description">{this.props.description}</p> : false;
    let article = this.props.article ? <p className="article">{this.props.article}</p> : false;
    let status = false;
    if (this.state.submitting) {
      status = (<div className="loading">
        <img alt="loading" src={logo_loading} />
      </div>)
    } else if (this.state.error) {
      status = (<div className="loading">
        <img className="loading_failed" alt="error" src={logo_error} />
      </div>)
    }
    return (
      <div className="gradio_interface" theme={this.props.theme}>
        {title}
        {description}
        <div className={classNames("panels", {
          "items-start": this.props.layout === "unaligned",
          "items-stretch": this.props.layout !== "unaligned",
          "flex-col": this.props.layout === "vertical",
        })}>
          <div className="panel">
            <div className="component_set">
              {this.props.input_components.map((component, index) => {
                const Component = input_component_map[component.name][0];
                return (
                  <div className="component" key={index}>
                    <div className="panel_header">{component.label}</div>
                    <Component {...component} handleChange={this.handleChange.bind(this, index)} value={this.state[index]} />
                  </div>);
              })}
            </div>
            <div className="panel_buttons">
              <button className="panel_button" onClick={this.clear}>Clear</button>
              {this.props.live ? false :
                <button className="panel_button submit" onClick={this.submit}>Submit</button>
              }
            </div>
          </div>
          <div className="panel">
            <div className={classNames("component_set", "relative",
              { "opacity-50": status && !this.props.live })}>
              {status}
              {this.props.output_components.map((component, index) => {
                const Component = output_component_map[component.name][0];
                const key = this.props.input_components.length + index;
                return (
                  <div className="component" key={key}>
                    <div className="panel_header">{component.label}</div>
                    <Component {...component} handleChange={this.handleChange.bind(this, key)} value={this.state[key]} />
                  </div>);
              })}
            </div>
            <div className="panel_buttons">
              {this.props.allow_interpretation ?
                <button className="panel_button">Interpret</button> : false
              }
              {this.props.allow_screenshot ?
                <div className="screenshot_set">
                  <button className="panel_button left_panel_button">Screenshot</button>
                  <button className="panel_button right_panel_button">GIF</button>
                  {this.state.screenshot_mode ?
                    <div className="screenshot_logo">
                      <img src="/static/img/logo_inline.png" alt="Gradio" />
                      <button className='record_stop'>
                        <div className='record_square'></div>
                      </button>
                    </div>
                    : false}
                </div>
                : false}
              {this.props.allow_flagging ?
                <button className={classNames("panel_button", { "disabled": this.state.complete === false })}
                  onClick={this.flag}>
                  {this.state.just_flagged ? "Flagged" : "Flag"}
                  {/* <div className="dropcontent"></div> */}
                </button>
                : false}
            </div>
          </div>
        </div>
        {this.props.examples ? <GradioInterfaceExamples examples={this.props.examples} examples_dir={this.examples_dir} example_id={this.state.example_id} input_components={this.props.input_components} output_components={this.props.output_components} handleExampleChange={this.handleExampleChange} /> : false}
        {article}
      </div>
    )
  }
}

class GradioInterfaceExamples extends React.Component {
  render() {
    return <div className="examples">
      <h4>Examples</h4>
      <div className="examples_control">
        <button className="load_prev examples-content">Load Previous <div className="shortcut">CTRL + <span style={{ "display": "inline-block", "transform": "scale(-1, 1)" }}>&#10140;</span></div></button>
        <button className="load_next examples-content">Load Next <div className="shortcut">CTRL + &#10140;</div></button>
        <button className="table_examples">
          <svg width="40" height="24"><rect x="0" y="0" width="40" height="6"></rect><rect x="0" y="9" width="40" height="6"></rect><rect x="0" y="18" width="40" height="6"></rect></svg>
        </button>
        <button className="gallery_examples current">
          <svg width="40" height="24"><rect x="0" y="0" width="18" height="40"></rect><rect x="22" y="0" width="18" height="40"></rect></svg>
        </button>
      </div>
      <div className="pages hidden">Page:</div>
      <table className="examples_table">
        <thead>
          <tr>
            {this.props.input_components.map((component, i) => {
              return <th key={i}>{component.label}</th>
            })}
            {this.props.examples[0].length > this.props.input_components.length ? this.props.output_components.map((component, i) => {
              return <th key={i + this.props.input_components.length}>{component.label}</th>
            }) : false}
          </tr>
        </thead>
        <tbody>
          {this.props.examples.map((example_row, i) => {
            return <tr key={i} className={classNames({ "selected": i === this.props.example_id })} onClick={() => this.props.handleExampleChange(i)}>
              {example_row.map((example_data, j) => {
                let ExampleComponent = input_component_map[this.props.input_components[j].name][1];
                return <td><ExampleComponent examples_dir={this.props.examples_dir} value={example_data} key={j} /></td>
              })}
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }
}


export default GradioInterface;