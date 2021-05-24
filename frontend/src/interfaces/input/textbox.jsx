import React from 'react';
import ComponentExample from '../component_example';

class TextboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(evt.target.value);
  }
  render() {
    if (this.props.lines > 1) {
      return (
        <div>
          <textarea className="input_text" value={this.props.value || ""} onChange={this.handleChange}>
          </textarea>
        </div>
      )
    } else {
      return <input type="text" className="input_text" onChange={this.handleChange} value={this.props.value || ""}></input>
    }
  }
}

class TextboxInputExample extends ComponentExample {
  render() {
    return <div className="input_textbox_example">{this.props.value}</div>
  }
}

export {TextboxInput, TextboxInputExample};
