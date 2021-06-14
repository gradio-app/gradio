import React from 'react';
import ComponentExample from '../component_example';
import { getSaliencyColor } from '../utils';

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
      {this.props.interpretation === null ?
        <>
          <input type="range" className="range" onChange={this.handleChange} value={this.props.value} min={this.props.minimum} max={this.props.maximum} step={this.props.step}></input>
          <div className="value">{this.props.value}</div>
        </>
        :
        <div class="interpret_range">
          {this.props.interpretation.map(value =>
            <div style={{ 'background-color': getSaliencyColor(value) }}>
            </div>
          )}
        </div>}
    </div>)
  }
}

class SliderInputExample extends ComponentExample {
  render() {
    return <div className="input_slider_example">{this.props.value}</div>
  }
}

export { SliderInput, SliderInputExample };
