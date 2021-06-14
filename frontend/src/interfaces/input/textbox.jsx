import React from 'react';
import ComponentExample from '../component_example';
import { getSaliencyColor } from '../utils';

class TextboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  render() {
    if (this.props.interpretation !== null) {
      return (
        <div className="input_text">
          <div class="interpretation">
            {this.props.interpretation.map((item, index) => <div class="interpretation_box" key={index} style={{ "backgroundColor": getSaliencyColor(item[1]) }}>{item[0]}</div>)}
          </div>
        </div>
      )
    } else if (this.props.lines > 1) {
      return (
        <div className="input_text">
          <textarea value={this.props.value || ""} onChange={this.handleChange}>
          </textarea>
        </div>
      )
    } else {
      return (<div className="input_text">
        <input type="text" onChange={this.handleChange} value={this.props.value || ""}></input>
      </div>)
    }
  }
}

class TextboxInputExample extends ComponentExample {
  render() {
    return <div className="input_textbox_example">{this.props.value}</div>
  }
}

export { TextboxInput, TextboxInputExample };
