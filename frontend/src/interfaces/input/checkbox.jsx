import React from 'react';
import classNames from "classnames";

class CheckboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange() {
    this.props.handleChange(this.props.value != true);
  }
  render() {
    return (<div className="input_checkbox">
      <div className={classNames("checkbox_item", {
        "selected": this.props.value
      })} onClick={this.handleChange}>
        <div className="checkbox">
          <svg class="check" viewBox="-10 -10 20 20">
            <line x1="-7.5" y1="0" x2="-2.5" y2="5"></line>
            <line x1="-2.5" y1="5" x2="7.5" y2="-7.5"></line>
          </svg>
        </div>
      </div>
    </div>)
  }
}

export default CheckboxInput;