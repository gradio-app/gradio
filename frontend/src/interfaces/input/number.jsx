import React from 'react';
import ComponentExample from '../component_example';
import { getSaliencyColor } from '../utils';

class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(evt) {
    let value = evt.target.value;
    let valid_non_numbers = ["", "-", ".", "-."];
    if (!isNaN(parseFloat(value)) || valid_non_numbers.includes(value)) {
      this.props.handleChange(evt.target.value);
    }
  }
  render() {
    return <div className="input_number">
      {this.props.interpretation === null ? 
        <input type="text" onChange={this.handleChange} value={this.props.value === null ? "" : this.props.value}></input>
       :
        <div class="interpretation">
          {this.props.interpretation.map((value, index) =>
            <div class="interpretation_box" key={index} style={{ "backgroundColor": getSaliencyColor(value[1]) }}>{value[0]}</div>
          )}
        </div>}
    </div>
  }
}


class NumberInputExample extends ComponentExample {
  render() {
    return <div className="input_number_example">{this.props.value}</div>
  }
}

export { NumberInput, NumberInputExample };
