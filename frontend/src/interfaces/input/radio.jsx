import React from 'react';
import classNames from "classnames";

class RadioInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    const index = this.props.choices.indexOf(this.props.default);
    if (index !== -1) {
      this.handleChange(index);
    }
  }
  handleChange(selected_index) {
    this.props.handleChange(selected_index);
  }
  render() {
      return (<div className="input_radio">
        {this.props.choices.map((item, index) => {
          return <div className={classNames("radio_item", {
            "selected": index == this.props.value
          })} onClick={this.handleChange.bind(this, index)} key={index}>
            <div className="radio_circle"></div>
            {item}
          </div>
        })}
      </div>)
  }
}

export default RadioInput;