import React from 'react';

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
        <input type="range" class="range" onChange={this.handleChange} value={this.props.value} min={this.props.minimum} max={this.props.maximum}></input>
        <div class="value">{this.props.value}</div>
      </div>)
  }
}

export default SliderInput;