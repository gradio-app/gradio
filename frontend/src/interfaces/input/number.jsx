import React from 'react';

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
      return <input type="text" className="input_number" onChange={this.handleChange} value={this.props.value || ""}></input>
  }
}

export default NumberInput;