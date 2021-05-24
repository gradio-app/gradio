import React from 'react';
import ComponentExample from '../component_example';

class SliderInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(evt) {
    this.props.handleChange(parseFloat(evt.target.value));
  }
  render() {
      return (<div className="input_slider">
        <input type="range" className="range" onChange={this.handleChange} value={this.props.value} min={this.props.minimum} max={this.props.maximum}></input>
        <div className="value">{this.props.value}</div>
      </div>)
  }
}

class SliderInputExample extends ComponentExample {
  render() {
    return <div className="input_slider_example">{this.props.value}</div>
  }
}

export {SliderInput, SliderInputExample};
